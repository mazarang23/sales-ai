"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DayAvailability = { day: number; enabled: boolean; start: string; end: string };
type Booking = { scheduledAt: string; hours: number };
type DragPoint = { dayIndex: number; minutes: number };
type Props = { consultantId: string; hourlyRate: number; isLoggedIn: boolean };

const SLOT_MINUTES = 30;
const GRID_START = 8 * 60;
const GRID_END = 21 * 60;
const DAY_NAMES = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

function pad(n: number) { return String(n).padStart(2, "0"); }
function toDateKey(d: Date) { return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; }
function addDays(d: Date, days: number) { const x = new Date(d); x.setUTCDate(x.getUTCDate() + days); return x; }
function startOfIranWeek() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tehran", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(new Date());
  const year = Number(parts.find(p => p.type === "year")?.value);
  const month = Number(parts.find(p => p.type === "month")?.value);
  const day = Number(parts.find(p => p.type === "day")?.value);
  const weekday = parts.find(p => p.type === "weekday")?.value;
  const dayMap: Record<string, number> = { Sat: 0, Sun: 1, Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6 };
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - (dayMap[weekday || "Sat"] ?? 0));
  return date;
}
function minutesToTime(total: number) { return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`; }
function localDateTime(dateKey: string, time: string) { return `${dateKey}T${time}`; }
function iranDateLabel(dateKey: string) {
  const d = new Date(`${dateKey}T12:00:00Z`);
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(d);
}
function bookingRange(booking: Booking) {
  const start = new Date(booking.scheduledAt).getTime();
  return [start, start + booking.hours * 60 * 60 * 1000] as const;
}

export function BookingForm({ consultantId, hourlyRate, isLoggedIn }: Props) {
  const router = useRouter();
  const [weekStart, setWeekStart] = useState(startOfIranWeek);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hours, setHours] = useState(1);
  const [scheduledAt, setScheduledAt] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<DragPoint | null>(null);
  const [dragEnd, setDragEnd] = useState<DragPoint | null>(null);

  const weekKey = toDateKey(weekStart);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const total = Math.round(hourlyRate * hours);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setScheduledAt("");
    setHours(1);
    fetch(`/api/consultants/${consultantId}/availability?weekStart=${weekKey}`)
      .then(async r => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "خطا در دریافت تقویم");
        if (!cancelled) { setAvailability(j.availability || []); setBookings(j.bookings || []); }
      })
      .catch(e => { if (!cancelled) setMsg(e instanceof Error ? e.message : "خطا در دریافت تقویم"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [consultantId, weekKey]);

  function isBlocked(dayIndex: number, timeMinutes: number, durationHours = hours) {
    const day = availability.find(d => d.day === dayIndex);
    if (!day?.enabled) return true;
    const time = minutesToTime(timeMinutes);
    const endTime = minutesToTime(timeMinutes + durationHours * 60);
    if (time < day.start || endTime > day.end) return true;
    const dateKey = toDateKey(days[dayIndex]);
    const start = new Date(`${dateKey}T${time}:00+03:30`).getTime();
    const end = start + durationHours * 60 * 60 * 1000;
    return bookings.some(b => { const [bs, be] = bookingRange(b); return start < be && end > bs; });
  }

  function isPast(dayIndex: number, timeMinutes: number) {
    const dateKey = toDateKey(days[dayIndex]);
    const value = new Date(`${dateKey}T${minutesToTime(timeMinutes)}:00+03:30`).getTime();
    return value <= Date.now();
  }

  function finishSelection(start: DragPoint, end: DragPoint) {
    if (start.dayIndex !== end.dayIndex) { setMsg("برای انتخاب بازه، داخل یک روز کلیک کن و بکش."); return; }
    const first = Math.min(start.minutes, end.minutes);
    const last = Math.max(start.minutes, end.minutes) + SLOT_MINUTES;
    const durationHours = (last - first) / 60;
    for (let m = first; m < last; m += SLOT_MINUTES) {
      if (isBlocked(start.dayIndex, m, 0.5) || isPast(start.dayIndex, m)) {
        setMsg("بازه انتخاب‌شده شامل زمان رزروشده، گذشته یا خارج از ساعت کاری است. بازه دیگری انتخاب کن.");
        setDragStart(null); setDragEnd(null);
        return;
      }
    }
    setScheduledAt(localDateTime(toDateKey(days[start.dayIndex]), minutesToTime(first)));
    setHours(durationHours);
    setMsg(null);
    setDragStart(null); setDragEnd(null);
  }

  function beginDrag(dayIndex: number, timeMinutes: number) {
    if (isBlocked(dayIndex, timeMinutes, 0.5) || isPast(dayIndex, timeMinutes)) return;
    setDragStart({ dayIndex, minutes: timeMinutes });
    setDragEnd({ dayIndex, minutes: timeMinutes });
    setMsg(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) return router.push(`/login?next=/consultants/${consultantId}`);
    if (!scheduledAt) return setMsg("برای انتخاب زمان، روی تقویم کلیک کن و بکش تا بازه جلسه مشخص شود.");
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/bookings/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consultantId, hours, scheduledAt, note }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      router.push(`/bookings/${j.bookingId}/requested`);
    } catch (e) { setMsg(e instanceof Error ? e.message : "خطا"); setBusy(false); }
  }

  const selected = scheduledAt ? `${scheduledAt.replace("T", " • ")} — ${minutesToTime(Number(scheduledAt.slice(11, 13)) * 60 + Number(scheduledAt.slice(14, 16)) + hours * 60)}` : "روی تقویم کلیک کن و بکش تا بازه را انتخاب کنی";
  const preview = dragStart && dragEnd && dragStart.dayIndex === dragEnd.dayIndex
    ? { dayIndex: dragStart.dayIndex, first: Math.min(dragStart.minutes, dragEnd.minutes), last: Math.max(dragStart.minutes, dragEnd.minutes) + SLOT_MINUTES }
    : null;

  return (
    <form onSubmit={submit} className="card overflow-hidden" dir="rtl">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div><div className="text-lg font-bold">انتخاب زمان مشاوره</div><p className="text-xs text-slate-500 mt-1">برای انتخاب بازه، روی زمان شروع کلیک کن و تا زمان پایان بکش؛ مدت و هزینه خودکار محاسبه می‌شود.</p></div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setWeekStart(d => addDays(d, -7))} className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50" aria-label="هفته قبل">‹</button>
            <button type="button" onClick={() => setWeekStart(startOfIranWeek())} className="btn-ghost text-xs">امروز</button>
            <button type="button" onClick={() => setWeekStart(d => addDays(d, 7))} className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50" aria-label="هفته بعد">›</button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50/60">
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-white border border-slate-200" /> قابل رزرو</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-slate-200" /> خارج از ساعت کاری / رزرو شده</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-brand-600" /> بازه انتخاب‌شده</span>
        </div>

        {loading ? <div className="h-80 grid place-items-center text-sm text-slate-500">در حال بارگذاری تقویم...</div> : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[64px_repeat(7,minmax(105px,1fr))] border-b border-slate-200">
                <div className="p-3 text-xs text-slate-400" />
                {days.map((d, i) => <div key={i} className="p-3 text-center border-r border-slate-100"><div className="text-xs font-semibold">{DAY_NAMES[i]}</div><div className="text-[11px] text-slate-400 mt-1">{iranDateLabel(toDateKey(d))}</div></div>)}
              </div>
              <div className="grid grid-cols-[64px_repeat(7,minmax(105px,1fr))] select-none touch-pan-y">
                {Array.from({ length: (GRID_END - GRID_START) / SLOT_MINUTES }, (_, row) => {
                  const mins = GRID_START + row * SLOT_MINUTES;
                  return <div key={mins} className="contents">
                    <div className="h-11 border-b border-slate-100 p-2 text-[10px] text-slate-400 text-left" dir="ltr">{mins % 60 === 0 ? minutesToTime(mins) : ""}</div>
                    {days.map((_, dayIndex) => {
                      const blocked = isBlocked(dayIndex, mins, 0.5) || isPast(dayIndex, mins);
                      const dateKey = toDateKey(days[dayIndex]);
                      const selectedStart = scheduledAt === localDateTime(dateKey, minutesToTime(mins));
                      const inPreview = !!preview && preview.dayIndex === dayIndex && mins >= preview.first && mins < preview.last;
                      const inSelected = !!scheduledAt && scheduledAt.startsWith(dateKey) && mins >= Number(scheduledAt.slice(11, 13)) * 60 + Number(scheduledAt.slice(14, 16)) && mins < Number(scheduledAt.slice(11, 13)) * 60 + Number(scheduledAt.slice(14, 16)) + hours * 60;
                      return <div key={`${dayIndex}-${mins}`} role="button" tabIndex={blocked ? -1 : 0} onPointerDown={() => beginDrag(dayIndex, mins)} onPointerEnter={() => { if (dragStart?.dayIndex === dayIndex) setDragEnd({ dayIndex, minutes: mins }); }} onPointerUp={() => { if (dragStart) finishSelection(dragStart, { dayIndex, minutes: mins }); }} onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && !blocked) { e.preventDefault(); finishSelection({ dayIndex, minutes: mins }, { dayIndex, minutes: mins }); } }} className={`h-11 border-b border-r border-slate-100 text-[11px] transition flex items-center justify-center cursor-pointer ${inPreview || inSelected || selectedStart ? "bg-brand-600 text-white font-bold" : blocked ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-white hover:bg-brand-50 hover:text-brand-700"}`} aria-label={`${DAY_NAMES[dayIndex]} ${minutesToTime(mins)}`}>{inPreview || inSelected || selectedStart ? (mins % 60 === 0 ? minutesToTime(mins) : "") : blocked ? "" : minutesToTime(mins)}</div>;
                    })}
                  </div>;
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4">
          <div className="text-xs text-brand-700">بازه انتخاب‌شده</div>
          <div className="font-bold mt-1" dir="ltr">{selected}</div>
          {scheduledAt && <div className="mt-2 text-sm text-brand-800">مدت جلسه: {hours.toLocaleString("fa-IR")} ساعت</div>}
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-sm"><div className="flex justify-between"><span>تعرفه ساعتی</span><span>{hourlyRate.toLocaleString("fa-IR")} تومان</span></div><div className="flex justify-between font-bold mt-1"><span>مبلغ کل</span><span>{total.toLocaleString("fa-IR")} تومان</span></div></div>
        <div><label className="text-sm font-medium">توضیح (اختیاری)</label><textarea className="input mt-1 h-24" value={note} onChange={e => setNote(e.target.value)} placeholder="درباره فروشگاه و هدف جلسه بنویس..." /></div>
        {msg && <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{msg}</div>}
        <button disabled={busy || !scheduledAt} className="btn-primary w-full py-3">{busy ? "در حال بررسی زمان..." : isLoggedIn ? "ثبت درخواست مشاوره" : "ورود و انتخاب زمان"}</button>
      </div>
    </form>
  );
}
