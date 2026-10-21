import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentConsultant } from "@/lib/consultant-auth";
import { notify, notifyAdmins } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const consultant = await getCurrentConsultant();
    if (!consultant) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const booking = await db.booking.findFirst({
      where: { id, consultantId: consultant.id }
    });
    if (!booking) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    if (booking.status !== "pending") {
      return NextResponse.json({ error: "این درخواست قابل تایید نیست" }, { status: 400 });
    }

    await db.booking.update({ where: { id }, data: { status: "accepted" } });

    // اعلان به کاربر
    await notify(
      { userId: booking.userId },
      {
        type: "booking_accepted",
        title: "درخواست جلسه تایید شد",
        body: `مشاور جلسه ${booking.hours} ساعته را تایید کرد. لطفاً پرداخت را انجام دهید.`,
        link: `/bookings/${booking.id}/pay`
      }
    );

    // اعلان به همه ادمین‌ها
    await notifyAdmins({
      type: "booking_pending_payment",
      title: "پرداخت در انتظار تایید ادمین",
      body: `جلسه ${booking.hours} ساعته (${booking.amount.toLocaleString("fa-IR")} تومان) توسط کاربر درخواست و مشاور تایید شد. منتظر پرداخت کاربر.`,
      link: `/admin/bookings`
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("booking accept error:", e?.message);
    return NextResponse.json({ error: "خطا در تایید درخواست" }, { status: 500 });
  }
}