import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notifications";
const AVAILABILITY_KEY = (id: string) => `consultant.availability.${id}`;
const DEFAULTS = Array.from({ length: 7 }, (_, day) => ({ day, enabled: day < 6, start: "09:00", end: "17:00" }));
function minutes(hhmm: string) { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; }
function consultantLocalParts(date: Date) { const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tehran", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(date); const weekday = parts.find(x => x.type === "weekday")?.value || "Sun"; const dayMap: Record<string, number> = { Sat: 0, Sun: 1, Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6 }; return { day: dayMap[weekday] ?? 1, time: `${parts.find(x => x.type === "hour")?.value || "00"}:${parts.find(x => x.type === "minute")?.value || "00"}` }; }
function parseConsultantDate(value: unknown) { const raw = String(value || ""); if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) return new Date(NaN); return new Date(`${raw}:00+03:30`); }
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { consultantId, hours: rawHours, note, scheduledAt: rawScheduledAt } = await req.json(); const hours = Math.max(1, Math.min(8, Number(rawHours) || 1)); const scheduledAt = parseConsultantDate(rawScheduledAt);
  if (!rawScheduledAt || Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) return NextResponse.json({ error: "زمان جلسه معتبر نیست" }, { status: 400 });
  const consultant = await db.consultant.findUnique({ where: { id: consultantId } }); if (!consultant || consultant.status !== "approved") return NextResponse.json({ error: "مشاور در دسترس نیست" }, { status: 404 });
  const existingUserBooking = await db.booking.findFirst({ where: { consultantId, userId: user.id, status: { in: ["pending", "accepted"] } } }); if (existingUserBooking) return NextResponse.json({ error: "شما یک درخواست فعال دارید" }, { status: 400 });
  const availabilityItem = await db.siteContent.findUnique({ where: { key: AVAILABILITY_KEY(consultantId) } }); let availability = DEFAULTS; try { if (availabilityItem) availability = JSON.parse(availabilityItem.value); } catch {}
  const local = consultantLocalParts(scheduledAt); const day = availability.find((x: any) => x.day === local.day); const startMinutes = minutes(local.time); const endMinutes = startMinutes + hours * 60;
  if (!day?.enabled || startMinutes < minutes(day.start) || endMinutes > minutes(day.end)) return NextResponse.json({ error: "این زمان خارج از ساعات کاری مشاور است" }, { status: 400 });
  const amount = consultant.hourlyRate * hours; const scheduledEnd = new Date(scheduledAt.getTime() + hours * 60 * 60 * 1000);
  try {
    const booking = await db.$transaction(async tx => { const active = await tx.booking.findMany({ where: { consultantId, status: { in: ["pending", "accepted"] }, scheduledAt: { not: null } }, select: { id: true, scheduledAt: true, hours: true } }); const conflict = active.some(b => { const start = b.scheduledAt!.getTime(); const end = start + b.hours * 60 * 60 * 1000; return scheduledAt.getTime() < end && scheduledEnd.getTime() > start; }); if (conflict) throw new Error("SLOT_TAKEN"); const created = await tx.booking.create({ data: { consultantId, userId: user.id, status: "pending", paymentStatus: "unpaid", hours, scheduledAt, amount, commission: 20 } }); if (note && String(note).trim()) await tx.message.create({ data: { bookingId: created.id, senderId: user.id, text: `📝 یادداشت اولیه: ${String(note).slice(0, 500)}` } }); return created; }, { isolationLevel: "Serializable" });
    await notify({ consultantId: consultant.id }, { type: "booking_new", title: "درخواست جلسه جدید", body: `${user.name || user.phone} یک جلسه ${hours} ساعته برای ${scheduledAt.toLocaleString("fa-IR")} درخواست کرد (${amount.toLocaleString("fa-IR")} تومان).`, link: `/consultant/bookings/${booking.id}` }); return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch (e) { if (e instanceof Error && e.message === "SLOT_TAKEN") return NextResponse.json({ error: "این بازه همین الان توسط درخواست دیگری گرفته شد. لطفاً زمان دیگری انتخاب کنید." }, { status: 409 }); console.error("booking create error:", e); return NextResponse.json({ error: "خطا در ثبت درخواست" }, { status: 500 }); }
}
