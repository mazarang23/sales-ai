import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { zarinpal, ZARINPAL_CALLBACK_BASE } from "@/lib/zarinpal";

const PLANS: Record<string, { amount: number; label: string }> = {
  pro: { amount: 890000, label: "رشد" },
  business: { amount: 4900000, label: "حرفه‌ای" }
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { plan } = await req.json();
  const planData = PLANS[plan];
  if (!planData) {
    return NextResponse.json({ error: "پلن نامعتبر" }, { status: 400 });
  }

  try {
    const sub = await db.subscription.create({
      data: {
        userId: user.id,
        plan,
        amount: planData.amount,
        status: "pending"
      }
    });

    const response = await zarinpal.payments.create({
      amount: planData.amount * 10,
      callback_url: `${ZARINPAL_CALLBACK_BASE}/api/subscription/verify?subId=${sub.id}`,
      description: `خرید پلن ${planData.label}`
    });

    await db.subscription.update({
      where: { id: sub.id },
      data: { authority: response.authority }
    });

    const redirectUrl = zarinpal.payments.getRedirectUrl(response.authority);
    return NextResponse.json({ ok: true, redirectUrl });
  } catch (e: any) {
    console.error("zarinpal subscription pay error:", e?.message);
    return NextResponse.json({ error: "خطا در اتصال به درگاه" }, { status: 500 });
  }
}