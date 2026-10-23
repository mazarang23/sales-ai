import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPlan, getAiQuestionsLimit } from "@/lib/plans";
import { getPublicAppUrl, getZarinpal, isZarinpalConfigured, PLAN_LABELS, PLAN_PRICES } from "@/lib/payments/zarinpal";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url), 303);

  const form = await req.formData();
  const plan = String(form.get("plan") || "");
  if (plan !== "pro" && plan !== "business") {
    return NextResponse.json({ error: "پلن انتخاب‌شده معتبر نیست." }, { status: 400 });
  }
  if (!isZarinpalConfigured()) {
    return NextResponse.json({ error: "درگاه زرین‌پال هنوز در محیط سایت فعال نشده است." }, { status: 503 });
  }

  const amountToman = PLAN_PRICES[plan];
  const subscription = await db.subscription.create({
    data: { userId: user.id, plan, amount: amountToman, status: "pending" },
  });

  try {
    const zarinpal = getZarinpal();
    const callbackUrl = `${getPublicAppUrl(req.url)}/api/payments/zarinpal/verify?subscription=${encodeURIComponent(subscription.id)}`;
    const result = await zarinpal.payments.create({
      amount: amountToman * 10,
      callback_url: callbackUrl,
      description: `خرید پلن ${PLAN_LABELS[plan]} فروش‌یار - ${subscription.id}`,
      mobile: user.phone || undefined,
      email: user.email || undefined,
    });

    const code = result?.data?.code;
    const authority = result?.data?.authority;
    if (code !== 100 || !authority) {
      await db.subscription.update({ where: { id: subscription.id }, data: { status: "failed" } });
      return NextResponse.json({ error: "زرین‌پال درخواست پرداخت را نپذیرفت." }, { status: 502 });
    }

    await db.subscription.update({ where: { id: subscription.id }, data: { authority } });
    return NextResponse.redirect(zarinpal.payments.getRedirectUrl(authority), 303);
  } catch (error) {
    console.error("zarinpal payment request failed:", error instanceof Error ? error.message : error);
    await db.subscription.update({ where: { id: subscription.id }, data: { status: "failed" } });
    return NextResponse.json({ error: "اتصال به درگاه پرداخت برقرار نشد." }, { status: 502 });
  }
}
