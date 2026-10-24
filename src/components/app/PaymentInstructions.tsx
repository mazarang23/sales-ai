"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PaymentInstructions({ bookingId, amount, info }: { bookingId: string; amount: number; info: { cardNumber: string; shaba: string; holderName: string; bankName: string } }) {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    if (!file) { setMsg("فایل رسید را انتخاب کنید."); setBusy(false); return; }
    const body = new FormData(); body.append("reference", reference); body.append("receipt", file);
    try {
      const r = await fetch(`/api/bookings/${bookingId}/payment`, { method: "POST", body });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || "خطا");
      setMsg("رسید ثبت شد و برای بررسی ادمین ارسال شد."); router.refresh();
    } catch (e) { setMsg(e instanceof Error ? e.message : "خطا"); } finally { setBusy(false); }
  }

  return <div className="space-y-4">
    <div className="card overflow-hidden">
      <div className="bg-slate-950 p-6 text-white"><div className="text-xs text-white/60">فروش‌یار · پرداخت جلسه</div><div className="mt-5 text-3xl font-black">{amount.toLocaleString("fa-IR")} <span className="text-sm font-normal text-white/60">تومان</span></div><div className="mt-2 text-xs text-white/50">مبلغ دقیق جلسه</div></div>
      <div className="p-6 space-y-4"><h2 className="font-black">اطلاعات واریز</h2><div className="rounded-2xl bg-slate-50 p-4 space-y-3 text-sm"><div><span className="text-slate-500">شماره کارت</span><div className="font-mono font-bold" dir="ltr">{info.cardNumber}</div></div><div><span className="text-slate-500">شماره شبا</span><div className="font-mono" dir="ltr">{info.shaba}</div></div><div><span className="text-slate-500">به نام</span><div className="font-bold">{info.holderName}</div></div><div><span className="text-slate-500">بانک</span><div>{info.bankName}</div></div></div></div>
    </div>
    <form onSubmit={submit} className="card p-6 space-y-4">
      <div><h2 className="font-black">بارگذاری رسید</h2><p className="text-xs text-slate-500 mt-1">JPG، PNG، WEBP یا PDF تا سقف ۵ مگابایت</p></div>
      <div><label className="text-sm font-medium">شماره پیگیری / مرجع</label><input className="input mt-1 w-full" dir="ltr" value={reference} onChange={e => setReference(e.target.value)} minLength={3} required /></div>
      <label className="block rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center cursor-pointer"><input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} /><div className="font-bold">{file ? file.name : "انتخاب رسید پرداخت"}</div><div className="text-xs text-slate-500 mt-1">برای تغییر فایل دوباره انتخاب کنید</div></label>
      {msg && <div className="rounded-xl bg-slate-100 p-3 text-sm">{msg}</div>}
      <button disabled={busy || !file} className="btn-primary w-full py-3 disabled:opacity-50">{busy ? "در حال ثبت…" : "ثبت رسید و ارسال برای بررسی"}</button>
    </form>
  </div>;
}
