import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { consultantId, hours: rawHours, note } = await req.json();
  const hours = Math.max(1, Math.min(8, Number(rawHours) || 1));

  const consultant = await db.consultant.findUnique({ where: { id: consultantId } });
  if (!consultant || consultant.status !== "approved") {
    return NextResponse.json({ error: "مشاور در دسترس نیست" }, { status: 404 });
  }

  const existing = await db.booking.findFirst({
    where: {
      consultantId,
      userId: user.id,
      status: { in: ["pending", "accepted"] }
    }
  });
  if (existing) {
    return NextResponse.json({ error: "شما یک درخواست فعال دارید" }, { status: 400 });
  }

  const amount = consultant.hourlyRate * hours;

  const booking = await db.booking.create({
    data: {
      consultantId,
      userId: user.id,
      status: "pending",
      paymentStatus: "unpaid",
      hours,
      amount,
      commission: 20
    }
  });

  if (note && String(note).trim()) {
    await db.message.create({
      data: {
        bookingId: booking.id,
        senderId: user.id,
        text: `📝 یادداشت اولیه: ${String(note).slice(0, 500)}`
      }
    });
  }

  await notify(
    { consultantId: consultant.id },
    {
      type: "booking_new",
      title: "درخواست جلسه جدید",
      body: `${user.name || user.phone} یک جلسه ${hours} ساعته رزرو کرد (${amount.toLocaleString("fa-IR")} تومان).`,
      link: `/consultant/bookings/${booking.id}`
    }
  );

  return NextResponse.json({ ok: true, bookingId: booking.id });
}