"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PaymentInstructions({
  bookingId,
  amount,
  info
}: {
  bookingId: string;
  amount: number;
  info: { cardNumber: string; shaba: string; holderName: string; bankName: string };
}) {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch(`/api/bookings/${bookingId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, note })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      setMsg("اطلاعات پرداخت ثبت شد. منتظر تایید ادمین بمان.");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-6 space-y-3">
        <div className="font-bold">پرداخت کارت‌به‌کارت</div>
        <p className="text-sm leading-6">
          مبلغ <span className="font-medium">{amount.toLocaleString("fa-IR")} تومان</span> را
          به یکی از روش‌های زیر واریز کنید و شماره پیگیری را ثبت کنید:
        </p>

        <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm" dir="ltr">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs">شماره کارت</span>
            <span className="font-mono text-base">{info.cardNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs">شماره شبا</span>
            <span className="font-mono text-sm">{info.shaba}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs">به نام</span>
            <span className="text-sm">{info.holderName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs">بانک</span>
            <span className="text-sm">{info.bankName}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-5">
          بعد از واریز، شماره پیگیری را در فرم زیر وارد کنید. ادمین در کمتر از ۲۴ ساعت تایید می‌کند.
        </p>
      </div>

      <form onSubmit={submit} className="card p-6 space-y-3">
        <div>
          <label className="text-sm font-medium">شماره پیگیری</label>
          <input
            className="input mt-1 text-left"
            dir="ltr"
            value={reference}
            onChange={e => setReference(e.target.value)}
            required
            minLength={3}
            placeholder="مثلاً 123456789"
          />
        </div>
        <div>
          <label className="text-sm font-medium">یادداشت (اختیاری)</label>
          <textarea
            className="input mt-1 h-20"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="مثلاً ۴ رقم آخر کارت"
          />
        </div>
        {msg && <div className="rounded-xl bg-slate-100 p-3 text-sm">{msg}</div>}
        <button disabled={busy} className="btn-primary w-full py-3">
          {busy ? "..." : "ثبت اطلاعات پرداخت"}
        </button>
      </form>
    </div>
  );
}