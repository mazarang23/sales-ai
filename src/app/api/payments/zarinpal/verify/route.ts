import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getZarinpal, isZarinpalConfigured, planExpiryFromNow } from "@/lib/payments/zarinpal";
import { getAiQuestionsLimit } from "@/lib/plans";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const subscriptionId = url.searchParams.get("subscription");
  const authority = url.searchParams.get("Authority");
  const status = url.searchParams.get("Status");

  if (!subscriptionId || !authority) {
    return NextResponse.redirect(new URL("/account/subscriptions?payment=invalid", req.url));
  }

  const subscription = await db.subscription.findUnique({ where: { id: subscriptionId } });
  if (!subscription || subscription.authority !== authority) {
    return NextResponse.redirect(new URL("/account/subscriptions?payment=invalid", req.url));
  }

  if (subscription.status === "paid") {
    return NextResponse.redirect(new URL("/account/subscriptions?payment=success", req.url));
  }

  if (status !== "OK" || !isZarinpalConfigured()) {
    await db.subscription.update({ where: { id: subscription.id }, data: { status: "failed" } });
    return NextResponse.redirect(new URL("/account/subscriptions?payment=cancelled", req.url));
  }

  try {
    const zarinpal = getZarinpal();
    const result = await zarinpal.verifications.verify({ amount: subscription.amount * 10, authority });
    const code = result?.data?.code;
    if (code !== 100 && code !== 101) {
      await db.subscription.update({ where: { id: subscription.id }, data: { status: "failed" } });
      return NextResponse.redirect(new URL("/account/subscriptions?payment=failed", req.url));
    }

    const now = new Date();
    const user = await db.user.findUnique({ where: { id: subscription.userId }, select: { planExpiresAt: true } });
    const expiresAt = planExpiryFromNow(user?.planExpiresAt);

    await db.$transaction([
      db.subscription.update({ where: { id: subscription.id }, data: { status: "paid", refId: String(result?.data?.ref_id ?? ""), paidAt: now, expiresAt } }),
      db.user.update({ where: { id: subscription.userId }, data: { plan: subscription.plan, planExpiresAt: expiresAt, aiQuestionsLimit: getAiQuestionsLimit(subscription.plan) } }),
    ]);

    return NextResponse.redirect(new URL("/account/subscriptions?payment=success", req.url));
  } catch (error) {
    console.error("zarinpal verification failed:", error instanceof Error ? error.message : error);
    return NextResponse.redirect(new URL("/account/subscriptions?payment=failed", req.url));
  }
}
