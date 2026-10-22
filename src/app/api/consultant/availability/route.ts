import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentConsultant } from "@/lib/consultant-auth";

const KEY = (id: string) => `consultant.availability.${id}`;
const DEFAULTS = Array.from({ length: 7 }, (_, day) => ({ day, enabled: day < 6, start: "09:00", end: "17:00" }));

export async function GET() {
  const consultant = await getCurrentConsultant();
  if (!consultant) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const item = await db.siteContent.findUnique({ where: { key: KEY(consultant.id) } });
  let availability = DEFAULTS;
  if (item) { try { availability = JSON.parse(item.value); } catch {} }
  return NextResponse.json({ availability });
}

export async function POST(req: NextRequest) {
  const consultant = await getCurrentConsultant();
  if (!consultant) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json();
  const availability = Array.isArray(body.availability) ? body.availability : [];
  if (availability.length !== 7) return NextResponse.json({ error: "برنامه باید برای ۷ روز هفته تنظیم شود" }, { status: 400 });
  for (const item of availability) {
    if (!Number.isInteger(item.day) || item.day < 0 || item.day > 6) return NextResponse.json({ error: "روز نامعتبر است" }, { status: 400 });
    if (item.enabled && (!/^([01]\d|2[0-3]):[0-5]\d$/.test(item.start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.end) || item.start >= item.end)) return NextResponse.json({ error: "ساعت شروع و پایان نامعتبر است" }, { status: 400 });
  }
  await db.siteContent.upsert({ where: { key: KEY(consultant.id) }, update: { type: "json", value: JSON.stringify(availability) }, create: { key: KEY(consultant.id), type: "json", value: JSON.stringify(availability) } });
  return NextResponse.json({ ok: true, availability });
}
