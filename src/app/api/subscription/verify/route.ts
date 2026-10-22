import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { zarinpal, ZARINPAL_CALLBACK_BASE } from "@/lib/zarinpal";
import { PLANS } from "@/lib/plans";
import { allocationFromPayment } from "@/lib/ai/usage";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");
  const subId = searchParams.get("subId");
  const base = ZARINPAL_CALLBACK_BASE;
  if (status !== "OK" || !authority || !subId) return NextResponse.redirect(`${base}/pricing?payment=failed`);
  const sub = await db.subscription.findUnique({ where: { id: subId } });
  if (!sub || sub.status === "paid") return NextResponse.redirect(`${base}/pricing?payment=error`);
  try {
    const result = await zarinpal.verifications.verify({ amount: sub.amount * 10, authority });
    if (result.code === 100 || result.code === 101) {
      const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 30);
      const plan = sub.plan === "business" ? PLANS.business : PLANS.pro;
      const aiCredit = allocationFromPayment(sub.amount);
      await db.$transaction([
        db.subscription.update({ where: { id: sub.id }, data: { status: "paid", refId: String(result.ref_id || ""), paidAt: new Date(), expiresAt } }),
        db.user.update({ where: { id: sub.userId }, data: { plan: sub.plan, planExpiresAt: expiresAt, aiQuestionsLimit: plan.aiQuestions, walletBalance: { increment: aiCredit } } })
      ]);
      return NextResponse.redirect(`${base}/pricing?payment=success`);
    }
    return NextResponse.redirect(`${base}/pricing?payment=verify_failed`);
  } catch (e) { console.error("zarinpal subscription verify error:", e); return NextResponse.redirect(`${base}/pricing?payment=error`); }
}
