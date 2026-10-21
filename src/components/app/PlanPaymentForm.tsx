"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PlanPaymentForm({
  plan,
  amount,
  info
}: {
  plan: string;
  amount: number;
  info: { cardNumber: string; shaba: string; holderName: string; bankName: string };
}) {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/subscription/payment-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, reference })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      setMsg("اطلاعات ثبت شد. منتظر تایید ادمین بمان.");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="card p-6 space-y-3">
        <p className="text-sm leading-6">
          مبلغ <span className="font-medium">{amount.toLocaleString("fa-IR")} تومان</span> را
          به یکی از روش‌های زیر واریز کنید:
        </p>
        <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm" dir="ltr">
          <div className="flex justify-between"><span className="text-slate-500 text-xs">شماره کارت</span><span className="font-mono">{info.cardNumber}</span></div>
          <div className="flex justify-between"><span className="text-slate-500 text-xs">شماره شبا</span><span className="font-mono text-sm">{info.shaba}</span></div>
          <div className="flex justify-between"><span className="text-slate-500 text-xs">به نام</span><span>{info.holderName}</span></div>
        </div>
        <div>
          <label className="text-sm font-medium">شماره پیگیری</label>
          <input className="input mt-1 text-left" dir="ltr" value={reference} onChange={e => setReference(e.target.value)} required minLength={3} />
        </div>
        {msg && <div className="rounded-xl bg-slate-100 p-3 text-sm">{msg}</div>}
        <button disabled={busy} className="btn-primary w-full py-3">
          {busy ? "..." : "ثبت اطلاعات پرداخت"}
        </button>
      </div>
    </form>
  );
}