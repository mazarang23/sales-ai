import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { zarinpal, ZARINPAL_CALLBACK_BASE } from "@/lib/zarinpal";

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
    return NextResponse.json({ error: "پرداخت فقط بعد از تایید مشاور" }, { status: 400 });
  }
  if (booking.paymentStatus === "paid") {
    return NextResponse.json({ error: "قبلاً پرداخت شده" }, { status: 400 });
  }

  try {
    const response = await zarinpal.payments.create({
      amount: booking.amount * 10, // تومان به ریال
      callback_url: `${ZARINPAL_CALLBACK_BASE}/api/bookings/${id}/verify`,
      description: `جلسه مشاوره - ${booking.id.slice(0, 8)}`
    });

    const redirectUrl = zarinpal.payments.getRedirectUrl(response.authority);
    return NextResponse.json({ ok: true, redirectUrl });
  } catch (e: any) {
    console.error("zarinpal booking pay error:", e?.message);
    return NextResponse.json({ error: "خطا در اتصال به درگاه" }, { status: 500 });
  }
}