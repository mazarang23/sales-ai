import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import OpenAI from "openai";
import { rateLimit } from "@/lib/rate-limit";
import { getModelForPlan, getAiQuestionsLimit } from "@/lib/plans";

export const maxDuration = 90;

function buildContext(rows: any[], upload: any): string {
  if (rows.length === 0) return "داده‌ای برای این آپلود موجود نیست.";

  const amounts = rows.map(r => r.amount).filter((x): x is number => x != null);
  const total = amounts.reduce((s, x) => s + x, 0);
  const avg = amounts.length ? total / amounts.length : 0;

  const customers = new Set(rows.map(r => r.customer).filter(Boolean));
  const products = new Set(rows.map(r => r.product).filter(Boolean));

  const productAgg = new Map<string, { revenue: number; count: number }>();
  for (const r of rows) {
    if (!r.product) continue;
    const c = productAgg.get(r.product) ?? { revenue: 0, count: 0 };
    c.revenue += r.amount ?? 0;
    c.count += 1;
    productAgg.set(r.product, c);
  }
  const topProducts = [...productAgg.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10);

  const customerAgg = new Map<string, { revenue: number; count: number }>();
  for (const r of rows) {
    if (!r.customer) continue;
    const c = customerAgg.get(r.customer) ?? { revenue: 0, count: 0 };
    c.revenue += r.amount ?? 0;
    c.count += 1;
    customerAgg.set(r.customer, c);
  }
  const topCustomers = [...customerAgg.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10);

  const dates = rows
    .map(r => (r.date ? new Date(r.date) : null))
    .filter((d): d is Date => d != null)
    .sort((a, b) => a.getTime() - b.getTime());
  const dateRange =
    dates.length > 0
      ? `${dates[0].toISOString().slice(0, 10)} تا ${dates[dates.length - 1].toISOString().slice(0, 10)}`
      : "نامشخص";

  const sample = rows.slice(0, 30).map(r => ({
    customer: r.customer,
    product: r.product,
    amount: r.amount,
    date: r.date ? new Date(r.date).toISOString().slice(0, 10) : null
  }));

  return `## خلاصه داده
- فایل: ${upload.fileName}
- بازه: ${dateRange}
- تعداد ردیف: ${rows.length}
- مشتری یکتا: ${customers.size}
- محصول یکتا: ${products.size}

## آمار مبالغ
- مجموع: ${Math.round(total).toLocaleString("fa-IR")} تومان
- میانگین: ${Math.round(avg).toLocaleString("fa-IR")} تومان

## ۱۰ محصول برتر
${topProducts.map(([n, v], i) => `${i + 1}. ${n}: ${Math.round(v.revenue).toLocaleString("fa-IR")} تومان (${v.count} فروش)`).join("\n") || "نامشخص"}

## ۱۰ مشتری برتر
${topCustomers.map(([n, v], i) => `${i + 1}. ${n}: ${Math.round(v.revenue).toLocaleString("fa-IR")} تومان (${v.count} خرید)`).join("\n") || "نامشخص"}

## نمونه ۳۰ ردیف اول
${JSON.stringify(sample, null, 2)}`;
}

function isPersian(text: string): boolean {
  const persianChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars = text.replace(/\s/g, "").length;
  if (totalChars === 0) return true;
  return persianChars / totalChars >= 0.2;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const limit = getAiQuestionsLimit(user.plan);
    if (user.plan === "free" && user.aiQuestionsUsed >= limit) {
      return NextResponse.json(
        {
          error: "LIMIT_REACHED",
          message: `سقف سوالات پلن «${user.plan === "free" ? "رایگان" : user.plan}» (${limit}) پر شده. برای ادامه، پلن خود را ارتقا دهید.`
        },
        { status: 403 }
      );
    }

    const { question, uploadId } = await req.json();
    if (!question || String(question).trim().length < 3) {
      return NextResponse.json({ error: "سوال کوتاه است" }, { status: 400 });
    }

    if (!rateLimit(`assistant:${user.id}`, 20, 60 * 1000)) {
      return NextResponse.json({ error: "تلاش زیاد. یک دقیقه صبر کنید." }, { status: 429 });
    }

    let context = "";
    let upload: any = null;
    if (uploadId) {
      upload = await db.upload.findUnique({ where: { id: uploadId } });
      const rows = await db.dataRow.findMany({ where: { uploadId }, take: 5000 });
      context = buildContext(rows, upload || { fileName: "نامشخص" });
    }

    let history: Array<{ role: string; content: string }> = [];
    if (uploadId) {
      const chatHistory = await db.chatMessage.findMany({
        where: { userId: user.id, uploadId },
        orderBy: { createdAt: "desc" },
        take: 10
      });
      history = chatHistory.reverse().map(h => ({ role: h.role, content: h.content }));
    }

    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1"
    });

    const model = getModelForPlan(user.plan);
    console.log("assistant: plan:", user.plan, "model:", model);

    const systemPrompt = `تو یک دستیار هوشمند و مشاور رشد فروشگاه هستی که فقط به زبان فارسی پاسخ می‌دهد.

## قواعد اجباری
1. پاسخ تو باید ۱۰۰٪ به زبان فارسی باشد.
2. از کلمات انگلیسی (به جز نام محصولات و برندها) استفاده نکن.
3. اگر داده کافی نیست، صادقانه و به فارسی بگو.
4. پاسخ‌هایت دقیق، عملی و مبتنی بر داده باشد.
5. اعداد را با ارقام فارسی بنویس.

## داده‌های فروشگاه
${context}`;

    const r = await client.chat.completions.create(
      {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: String(question).slice(0, 1000) }
        ],
        max_tokens: 4000,
        temperature: 0.4
      },
      { timeout: 80000 }
    );

    let rawContent = r.choices?.[0]?.message?.content;
    if (!rawContent || !rawContent.trim()) {
      return NextResponse.json({ error: "مدل پاسخی تولید نکرد." }, { status: 502 });
    }

    if (!isPersian(rawContent)) {
      try {
        const tr = await client.chat.completions.create(
          {
            model,
            messages: [
              { role: "system", content: "این متن را به فارسی روان ترجمه کن. فقط ترجمه را برگردان." },
              { role: "user", content: rawContent }
            ],
            max_tokens: 4000,
            temperature: 0.2
          },
          { timeout: 60000 }
        );
        const translated = tr.choices?.[0]?.message?.content;
        if (translated && isPersian(translated)) rawContent = translated;
      } catch (e) {
        console.error("translation error:", e);
      }
    }

    if (uploadId) {
      await db.chatMessage.createMany({
        data: [
          { userId: user.id, uploadId, role: "user", content: String(question).slice(0, 2000) },
          { userId: user.id, uploadId, role: "assistant", content: rawContent.slice(0, 4000) }
        ]
      });
    }

    await db.user.update({
      where: { id: user.id },
      data: { aiQuestionsUsed: { increment: 1 } }
    });

    return NextResponse.json({
      answer: rawContent,
      remaining: Math.max(0, limit - user.aiQuestionsUsed - 1)
    });
  } catch (e: any) {
    console.error("assistant error:", e?.status, e?.message);
    return NextResponse.json({ error: "خطا در پردازش." }, { status: 500 });
  }
}