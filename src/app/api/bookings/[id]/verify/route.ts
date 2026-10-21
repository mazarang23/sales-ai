import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { zarinpal, ZARINPAL_CALLBACK_BASE } from "@/lib/zarinpal";
import { notify } from "@/lib/notifications";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");

  const base = ZARINPAL_CALLBACK_BASE;

  if (status !== "OK" || !authority) {
    return NextResponse.redirect(`${base}/bookings/${id}?payment=failed`);
  }

  const booking = await db.booking.findUnique({
    where: { id },
    include: { consultant: { select: { id: true, displayName: true } } }
  });
  if (!booking) return NextResponse.redirect(`${base}/bookings/${id}?payment=error`);

  try {
    const result = await zarinpal.verifications.verify({
      amount: booking.amount * 10,
      authority
    });

    if (result.code === 100 || result.code === 101) {
      await db.booking.update({
        where: { id },
        data: { paymentStatus: "paid", paidAt: new Date() }
      });

      await notify(
        { consultantId: booking.consultantId },
        {
          type: "booking_paid",
          title: "پرداخت جلسه انجام شد",
          body: `کاربر مبلغ جلسه ${booking.hours} ساعته را پرداخت کرد. حالا می‌توانید چت را شروع کنید.`,
          link: `/consultant/bookings/${booking.id}`
        }
      );

      return NextResponse.redirect(`${base}/bookings/${id}?payment=success`);
    }
    return NextResponse.redirect(`${base}/bookings/${id}?payment=verify_failed`);
  } catch (e) {
    console.error("zarinpal booking verify error:", e);
    return NextResponse.redirect(`${base}/bookings/${id}?payment=error`);
  }
}