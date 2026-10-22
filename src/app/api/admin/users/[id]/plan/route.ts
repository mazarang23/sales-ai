import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getAiQuestionsLimit, getPlan, PLANS } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const plan = getPlan(String(body.plan || ""));

  if (!PLANS[plan] || String(body.plan || "") !== plan) {
    return NextResponse.json({ error: "پلن نامعتبر است" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "کاربر پیدا نشد" }, { status: 404 });

  const now = new Date();
  const expiresAt = plan === "free"
    ? null
    : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const updated = await db.user.update({
    where: { id },
    data: {
      plan,
      planExpiresAt: expiresAt,
      aiQuestionsLimit: getAiQuestionsLimit(plan),
      aiQuestionsUsed: 0
    },
    select: { id: true, plan: true, planExpiresAt: true, aiQuestionsLimit: true }
  });

  return NextResponse.json({ ok: true, user: updated });
}