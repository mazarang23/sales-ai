import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PLANS, getPlan } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const body = await req.json();
  const userId = typeof body.userId === "string" ? body.userId : "";
  const plan = body.plan;
  if (!userId || !["free", "pro", "business"].includes(plan)) return NextResponse.json({ error: "پلن نامعتبر" }, { status: 400 });
  const planData = PLANS[getPlan(plan)];
  const target = await db.user.findUnique({ where: { id: userId }, select: { id: true, plan: true, planExpiresAt: true } });
  if (!target) return NextResponse.json({ error: "کاربر پیدا نشد" }, { status: 404 });
  const expiresAt = plan === "free" ? null : new Date(Date.now() + 30 * 86400000);

  // A manual plan edit is not a payment: do not reset usage or silently grant AI wallet credit.
  await db.$transaction([
    db.subscription.create({
      data: {
        userId,
        plan,
        amount: 0,
        status: "manual",
        expiresAt,
        refId: `admin:${admin.id};from:${target.plan};to:${plan}`
      }
    }),
    db.user.update({
      where: { id: userId },
      data: { plan, planExpiresAt: expiresAt, aiQuestionsLimit: planData.aiQuestions }
    })
  ]);
  return NextResponse.json({ ok: true, plan, expiresAt, usagePreserved: true, walletPreserved: true });
}