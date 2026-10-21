import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentConsultant } from "@/lib/consultant-auth";

async function getBookingAndRole(bookingId: string) {
  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return null;

  const user = await getCurrentUser();
  if (user && booking.userId === user.id) {
    return { booking, role: "user" as const, senderId: user.id };
  }
  const consultant = await getCurrentConsultant();
  if (consultant && booking.consultantId === consultant.id) {
    return { booking, role: "consultant" as const, senderId: consultant.id };
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getBookingAndRole(id);
  if (!ctx) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const messages = await db.message.findMany({
    where: { bookingId: id },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json({
    messages,
    role: ctx.role,
    senderId: ctx.senderId
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getBookingAndRole(id);
  if (!ctx) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { text } = await req.json();
  if (!text || String(text).trim().length < 1) {
    return NextResponse.json({ error: "متن خالی است" }, { status: 400 });
  }

  const msg = await db.message.create({
    data: {
      bookingId: id,
      senderId: ctx.senderId,
      text: String(text).slice(0, 1000)
    }
  });

  return NextResponse.json({ ok: true, message: msg });
}