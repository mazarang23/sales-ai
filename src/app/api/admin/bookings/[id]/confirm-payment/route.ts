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

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (booking.paymentStatus !== "pending_review") {
    return NextResponse.json({ error: "این تراکنش در انتظار تایید نیست" }, { status: 400 });
  }

  await db.booking.update({
    where: { id },
    data: { paymentStatus: "paid", paidAt: new Date() }
  });

  return NextResponse.json({ ok: true });
}