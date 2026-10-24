import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const reason = String(body.reason || "رسید یا اطلاعات پرداخت قابل تایید نیست").slice(0, 500);
  const sub = await db.subscription.findUnique({ where: { id } });
  if (!sub) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (sub.status !== "pending") return NextResponse.json({ error: "قابل رد کردن نیست" }, { status: 400 });
  await db.subscription.update({ where: { id }, data: { status: "rejected", refId: `${sub.refId || ""}|rejection:${reason}` } });
  return NextResponse.json({ ok: true });
}
