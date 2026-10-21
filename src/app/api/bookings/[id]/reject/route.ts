import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentConsultant } from "@/lib/consultant-auth";
import { notify } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const consultant = await getCurrentConsultant();
  if (!consultant) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const booking = await db.booking.findFirst({
    where: { id, consultantId: consultant.id }
  });
  if (!booking) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (booking.status !== "pending") {
    return NextResponse.json({ error: "قابل رد نیست" }, { status: 400 });
  }

  await db.booking.update({ where: { id }, data: { status: "rejected" } });

  await notify(
    { userId: booking.userId },
    {
      type: "booking_rejected",
      title: "درخواست جلسه رد شد",
      body: `متأسفانه مشاور درخواست جلسه ${booking.hours} ساعته شما را رد کرد.`,
      link: `/bookings/${booking.id}`
    }
  );

  return NextResponse.json({ ok: true });
}