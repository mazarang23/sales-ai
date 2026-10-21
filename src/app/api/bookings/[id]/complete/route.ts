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
  if (booking.status !== "accepted") {
    return NextResponse.json({ error: "قابل تکمیل نیست" }, { status: 400 });
  }

  await db.booking.update({ where: { id }, data: { status: "completed" } });

  await notify(
    { userId: booking.userId },
    {
      type: "booking_completed",
      title: "جلسه تکمیل شد",
      body: "جلسه شما تکمیل شد. لطفاً امتیاز و نظر خود را ثبت کنید.",
      link: `/bookings/${booking.id}`
    }
  );

  return NextResponse.json({ ok: true });
}