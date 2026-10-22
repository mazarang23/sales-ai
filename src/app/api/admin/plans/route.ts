import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PLANS, getPlan } from "@/lib/plans";
import { allocationFromPayment } from "@/lib/ai/usage";

export async function POST(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { userId, plan } = await req.json();
  if (!["free", "pro", "business"].includes(plan)) return NextResponse.json({ error: "پلن نامعتبر" }, { status: 400 });
  const planData = PLANS[getPlan(plan)];
  const expiresAt = plan === "free" ? null : new Date(Date.now() + 30 * 86400000);
  const credit = plan === "free" ? 0 : allocationFromPayment(planData.price);
  await db.user.update({ where: { id: userId }, data: { plan, planExpiresAt: expiresAt, aiQuestionsLimit: planData.aiQuestions, aiQuestionsUsed: 0, walletBalance: credit ? { increment: credit } : undefined } });
  return NextResponse.json({ ok: true, aiCreditAdded: credit });
}
