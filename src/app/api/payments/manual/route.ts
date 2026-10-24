import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login?next=/account/upgrade", req.url), 303);

  const form = await req.formData();
  const plan = String(form.get("plan") || "");
  if (plan !== "pro" && plan !== "business") {
    return NextResponse.json({ error: "پلن انتخاب‌شده معتبر نیست." }, { status: 400 });
  }

  const existing = await db.subscription.findFirst({
    where: { userId: user.id, plan, status: { in: ["pending_payment", "pending"] } },
    orderBy: { createdAt: "desc" }
  });

  const subscription = existing || await db.subscription.create({
    data: {
      userId: user.id,
      plan,
      amount: PLANS[plan].price,
      status: "pending_payment"
    }
  });

  return NextResponse.redirect(new URL(`/account/payment/${subscription.id}`, req.url), 303);
}
