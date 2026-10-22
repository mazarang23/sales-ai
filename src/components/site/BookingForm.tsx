"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function BookingForm({ consultantId, hourlyRate, isLoggedIn }: { consultantId: string; hourlyRate: number; isLoggedIn: boolean }) {
  const router = useRouter(); const [hours, setHours] = useState(1); const [scheduledAt, setScheduledAt] = useState(""); const [note, setNote] = useState(""); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState<string | null>(null); const total = hourlyRate * hours;
  async function submit(e: React.FormEvent) { e.preventDefault(); if (!isLoggedIn) return router.push(`/login?next=/consultants/${consultantId}`); if (!scheduledAt) return setMsg("تاریخ و ساعت جلسه را انتخاب کنید"); setBusy(true); setMsg(null); try { const r = await fetch("/api/bookings/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consultantId, hours, scheduledAt, note }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error || "خطا"); router.push(`/bookings/${j.bookingId}/requested`); } catch (e) { setMsg(e instanceof Error ? e.message : "خطا"); setBusy(false); } }
  return <form onSubmit={submit} className="card p-6 space-y-4"><div className="font-bold">رزرو جلسه</div>
    <div><label className="text-sm font-medium">مدت جلسه (ساعت)</label><div className="mt-2 flex gap-2 flex-wrap">{[1,2,3,4].map(h => <button type="button" key={h} onClick={() => setHours(h)} className={`rounded-xl border px-4 py-2 text-sm transition ${hours === h ? "bg-brand-600 text-white border-brand-600" : "border-slate-200 hover:border-slate-300"}`}>{h} ساعت</button>)}</div></div>
    <div><label className="text-sm font-medium">زمان پیشنهادی جلسه</label><input type="datetime-local" className="input mt-1" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required /><p className="text-xs text-slate-500 mt-1">زمان را بر اساس ساعت ایران انتخاب کن؛ فقط داخل ساعات کاری مشاور قابل ثبت است.</p></div>
    <div className="rounded-xl bg-slate-50 p-3 text-sm"><div className="flex justify-between"><span>تعرفه ساعتی</span><span>{hourlyRate.toLocaleString("fa-IR")} تومان</span></div><div className="flex justify-between font-bold mt-1"><span>مبلغ کل</span><span>{total.toLocaleString("fa-IR")} تومان</span></div></div>
    <div><label className="text-sm font-medium">توضیح (اختیاری)</label><textarea className="input mt-1 h-24" value={note} onChange={e => setNote(e.target.value)} placeholder="درباره فروشگاه و هدف جلسه بنویس..." /></div>
    {msg && <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{msg}</div>}<button disabled={busy} className="btn-primary w-full py-3">{busy ? "در حال بررسی زمان..." : isLoggedIn ? "ارسال درخواست" : "ورود و ارسال درخواست"}</button>
  </form>;
}
