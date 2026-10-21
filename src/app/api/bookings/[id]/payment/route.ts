import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking || booking.userId !== user.id) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (booking.status !== "accepted") {
    return NextResponse.json(
      { error: "پرداخت فقط بعد از تایید مشاور ممکن است" },
      { status: 400 }
    );
  }
  if (booking.paymentStatus !== "unpaid") {
    return NextResponse.json({ error: "پرداخت قبلاً ثبت شده" }, { status: 400 });
  }

  const { reference, note } = await req.json();
  if (!reference || String(reference).trim().length < 3) {
    return NextResponse.json({ error: "شماره پیگیری را وارد کنید" }, { status: 400 });
  }

  await db.booking.update({
    where: { id },
    data: { paymentStatus: "pending_review" }
  });

  await db.message.create({
    data: {
      bookingId: id,
      senderId: user.id,
      text: `💳 اعلام پرداخت — شماره پیگیری: ${String(reference).slice(0, 100)}${note ? ` | یادداشت: ${String(note).slice(0, 300)}` : ""}`
    }
  });

  return NextResponse.json({ ok: true });
}