import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const AVAILABILITY_KEY = (id: string) => `consultant.availability.${id}`;
const DEFAULTS = Array.from({ length: 7 }, (_, day) => ({
  day,
  enabled: day < 6,
  start: "09:00",
  end: "17:00"
}));

function parseLocal(value: string) {
  return new Date(`${value}T00:00:00+03:30`);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const weekStart = req.nextUrl.searchParams.get("weekStart") || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    return NextResponse.json({ error: "هفته نامعتبر است" }, { status: 400 });
  }

  const consultant = await db.consultant.findUnique({
    where: { id },
    select: { id: true, status: true }
  });
  if (!consultant || consultant.status !== "approved") {
    return NextResponse.json({ error: "مشاور در دسترس نیست" }, { status: 404 });
  }

  const start = parseLocal(weekStart);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [availabilityItem, bookings] = await Promise.all([
    db.siteContent.findUnique({ where: { key: AVAILABILITY_KEY(id) } }),
    db.booking.findMany({
      where: {
        consultantId: id,
        status: { in: ["pending", "accepted"] },
        scheduledAt: { gte: start, lt: end }
      },
      select: { scheduledAt: true, hours: true },
      orderBy: { scheduledAt: "asc" }
    })
  ]);

  let availability = DEFAULTS;
  if (availabilityItem) {
    try {
      const parsed = JSON.parse(availabilityItem.value);
      if (Array.isArray(parsed) && parsed.length === 7) availability = parsed;
    } catch {}
  }

  return NextResponse.json({
    timezone: "Asia/Tehran",
    weekStart,
    availability,
    bookings: bookings.map(b => ({
      scheduledAt: b.scheduledAt!.toISOString(),
      hours: b.hours
    }))
  });
}
