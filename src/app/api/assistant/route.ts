import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import OpenAI from "openai";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getModelForPlan, getAiQuestionsLimit } from "@/lib/plans";
import { computeKpis, topBy } from "@/lib/analytics/kpi";
import { computeRfm } from "@/lib/analytics/rfm";
import { computeCohort } from "@/lib/analytics/cohort";
import { recordAiUsage, getAiWallet } from "@/lib/ai/usage";

export const maxDuration = 90;

function buildContext(rows: any[], upload: any): string {
  if (!rows.length) return "داده‌ای برای این فایل موجود نیست.";
  const kpis = computeKpis(rows as any);
  const rfm = computeRfm(rows as any);
  const segments = { Champions: 0, Loyal: 0, Potential: 0, AtRisk: 0, Lost: 0 };
  for (const r of rfm) if (r.segment in segments) segments[r.segment as keyof typeof segments] += 1;
  const topProducts = topBy(rows as any, "product", 8);
  const topCustomers = topBy(rows as any, "customer", 8);
  const dates = rows.map(r => r.date ? new Date(r.date) : null).filter((d): d is Date => !!d && Number.isFinite(d.getTime())).sort((a, b) => a.getTime() - b.getTime());
  const dateRange = dates.length ? `${dates[0].toISOString().slice(0, 10)} تا ${dates[dates.length - 1].toISOString().slice(0, 10)}` : "نامشخص";
  const headers = upload?.mappings?.headers;
  const columnNames = Array.isArray(headers) ? headers.slice(0, 30).map(String).join("، ") : "نامشخص";
  const cohort = computeCohort(rows as any, "month");
  const cohortSummary = cohort.slice(-6).map(c => `${c.cohortLabel} (${c.size}) [${c.periods.slice(0, 6).map(p => `${p.index}:${p.retained}/${c.size}`).join(",")}]`).join("\n") || "نامشخص";
  return `## زمینه داده فروش
فایل: ${String(upload?.fileName || "نامشخص").slice(0, 120)}
بازه: ${dateRange}
ردیف: ${rows.length}
ستون‌ها: ${columnNames}

## KPI
فروش کل: ${Math.round(kpis.total)}
مشتری یکتا: ${kpis.customers}
سفارش: ${kpis.orders}
میانگین سبد: ${Math.round(kpis.aov)}

## RFM
Champions=${segments.Champions}, Loyal=${segments.Loyal}, Potential=${segments.Potential}, AtRisk=${segments.AtRisk}, Lost=${segments.Lost}

## محصولات برتر
${topProducts.map(([n, v], i) => `${i + 1}. ${String(n).slice(0, 80)}: ${Math.round(v.amount)} / ${v.count}`).join("\n") || "نامشخص"}

## مشتریان برتر
${topCustomers.map(([n, v], i) => `${i + 1}. ${String(n).slice(0, 80)}: ${Math.round(v.amount)} / ${v.count}`).join("\n") || "نامشخص"}

## کوهورت ماهانه
${cohortSummary}`;
}
function isPersian(text: string): boolean { const p = (text.match(/[\u0600-\u06FF]/g) || []).length; const t = text.replace(/\s/g, "").length; return t === 0 || p / t >= 0.2; }

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const limit = getAiQuestionsLimit(user.plan);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const usedThisMonth = await db.chatMessage.count({ where: { userId: user.id, role: "user", createdAt: { gte: monthStart } } });
    if (usedThisMonth >= limit) return NextResponse.json({ error: "LIMIT_REACHED", message: `سقف سوالات پلن شما (${limit} در ماه) پر شده است.` }, { status: 403 });

    const { question, uploadId } = await req.json();
    const cleanQuestion = String(question || "").trim();
    if (cleanQuestion.length < 3) return NextResponse.json({ error: "سوال کوتاه است" }, { status: 400 });
    if (!rateLimit(`assistant:${user.id}`, 20, 60 * 1000)) return NextResponse.json({ error: "تلاش زیاد. یک دقیقه صبر کنید." }, { status: 429 });

    let context = "", upload: any = null;
    if (uploadId) {
      upload = await db.upload.findFirst({ where: { id: uploadId, userId: user.id }, include: { mappings: true } });
      if (!upload) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
      const rows = await db.dataRow.findMany({ where: { uploadId }, take: 50000, orderBy: { date: "asc" } });
      context = buildContext(rows, upload);
    }
    const history = uploadId ? (await db.chatMessage.findMany({ where: { userId: user.id, uploadId }, orderBy: { createdAt: "desc" }, take: 6 })).reverse().map(h => ({ role: h.role as "user" | "assistant", content: h.content.slice(0, 1200) })) : [];
    const client = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: "https://openrouter.ai/api/v1" });
    const model = getModelForPlan(user.plan);
    const wallet = await getAiWallet(user.id);
    if (user.plan !== "free" && wallet <= 0 && process.env.AI_USD_TO_TOMAN) return NextResponse.json({ error: "AI_CREDIT_EMPTY", message: "اعتبار هوش مصنوعی حساب شما تمام شده است. برای ادامه، حساب را شارژ کنید." }, { status: 402 });

    const systemPrompt = `نقش: مشاور تحلیل فروش و رشد کسب‌وکار.
زبان پاسخ: فارسی روان و دقیق؛ اعداد فارسی.
فقط از داده‌های ارائه‌شده استفاده کن. اگر داده کافی نیست صریح بگو و عدد حدس نزن. بین واقعیت داده، برداشت تحلیلی و پیشنهاد تفاوت بگذار. پاسخ متناسب با سوال و کوتاه باشد.
داده خام تک‌تک تراکنش‌ها ارسال نشده؛ از KPI، RFM، کوهورت و رتبه‌بندی‌های زیر برای استدلال استفاده کن.

${context || "هیچ فایل فروشی به سوال متصل نیست."}`;
    const r = await client.chat.completions.create({ model, messages: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: cleanQuestion.slice(0, 1200) }], max_tokens: 1200, temperature: 0.25, usage: { include: true } as any } as any, { timeout: 80000 });
    let rawContent = r.choices?.[0]?.message?.content;
    if (!rawContent?.trim()) return NextResponse.json({ error: "مدل پاسخی تولید نکرد." }, { status: 502 });

    if (!isPersian(rawContent)) {
      try {
        const tr = await client.chat.completions.create({ model, messages: [{ role: "system", content: "متن زیر را به فارسی روان و دقیق ترجمه کن؛ فقط ترجمه را برگردان." }, { role: "user", content: rawContent.slice(0, 5000) }], max_tokens: 1200, temperature: 0.1, usage: { include: true } as any } as any, { timeout: 60000 });
        const translated = tr.choices?.[0]?.message?.content; if (translated && isPersian(translated)) rawContent = translated;
        if (tr.usage) await recordAiUsage({ userId: user.id, task: "translation", model, usage: tr.usage, uploadId: uploadId || undefined });
      } catch (e) { console.error("translation error:", e); }
    }
    const usageResult = await recordAiUsage({ userId: user.id, task: "assistant", model, usage: r.usage, uploadId: uploadId || undefined });
    if (!usageResult.charged && usageResult.costToman > 0 && user.plan !== "free") return NextResponse.json({ error: "AI_CREDIT_EMPTY", message: "اعتبار هوش مصنوعی برای این درخواست کافی نبود." }, { status: 402 });
    if (uploadId) await db.chatMessage.createMany({ data: [{ userId: user.id, uploadId, role: "user", content: cleanQuestion.slice(0, 2000) }, { userId: user.id, uploadId, role: "assistant", content: rawContent.slice(0, 4000) }] });
    await db.user.update({ where: { id: user.id }, data: { aiQuestionsUsed: { increment: 1 } } });
    return NextResponse.json({ answer: rawContent, remaining: Math.max(0, limit - usedThisMonth - 1), usage: usageResult });
  } catch (e: any) { console.error("assistant error:", e?.status, e?.message); return NextResponse.json({ error: "خطا در پردازش." }, { status: 500 }); }
}
