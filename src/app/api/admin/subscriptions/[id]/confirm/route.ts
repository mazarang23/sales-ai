import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const sub = await db.subscription.findUnique({ where: { id } });
  if (!sub) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (sub.status !== "pending") {
    return NextResponse.json({ error: "قابل تایید نیست" }, { status: 400 });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await db.$transaction([
    db.subscription.update({
      where: { id },
      data: { status: "paid", paidAt: new Date(), expiresAt }
    }),
    db.user.update({
      where: { id: sub.userId },
      data: {
        plan: sub.plan,
        planExpiresAt: expiresAt,
        aiQuestionsLimit: sub.plan === "business" ? 99999 : 50
      }
    })
  ]);

  return NextResponse.json({ ok: true });
}