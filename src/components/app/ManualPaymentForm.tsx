"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ManualPaymentForm({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError("رسید را انتخاب کنید.");
    setBusy(true); setError(null);
    const body = new FormData();
    body.append("reference", reference);
    body.append("receipt", file);
    const r = await fetch(`/api/payments/manual/${subscriptionId}/receipt`, { method: "POST", body });
    const data = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setError(data.error || "ثبت رسید انجام نشد.");
    router.refresh();
  }

  return <form onSubmit={submit} className="card p-6 space-y-5">
    <div><h2 className="text-xl font-black">ثبت رسید پرداخت</h2><p className="mt-1 text-sm text-slate-500">بعد از واریز، این دو مورد را ثبت کن.</p></div>
    <div><label className="text-sm font-medium">شماره پیگیری / مرجع تراکنش</label><input className="input mt-2 w-full" dir="ltr" value={reference} onChange={e => setReference(e.target.value)} placeholder="مثلاً 123456789" minLength={3} required /></div>
    <label className="block rounded-3xl border-2 border-dashed border-slate-200 p-6 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition"><input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} /><div className="text-3xl">↥</div><div className="mt-2 font-bold">رسید را انتخاب یا اینجا رها کنید</div><div className="mt-1 text-xs text-slate-500">JPG، PNG، WEBP یا PDF · حداکثر ۵ مگابایت</div>{file && <div className="mt-4 rounded-xl bg-slate-100 px-3 py-2 text-sm">{file.name}</div>}</label>
    {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <button disabled={busy || !file} className="btn-primary w-full py-3 disabled:opacity-50">{busy ? "در حال ثبت رسید…" : "ثبت رسید برای بررسی"}</button>
  </form>;
}
