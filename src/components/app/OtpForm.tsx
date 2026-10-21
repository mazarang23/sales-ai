"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const INDUSTRIES = [
  { v: "clothing", l: "پوشاک" },
  { v: "gold", l: "طلا" },
  { v: "cosmetics", l: "آرایشی" },
  { v: "restaurant", l: "رستوران" },
  { v: "grocery", l: "سوپرمارکت" },
  { v: "digital", l: "دیجیتال" },
  { v: "social", l: "فروش اینستاگرامی" },
  { v: "other", l: "سایر" }
];

export function OtpForm({ mode = "register" }: { mode?: "register" | "login" }) {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      setStep("code");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, name, industry })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      router.push(j.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  }

  if (step === "phone") {
    return (
      <form onSubmit={sendOtp} className="card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">شماره موبایل</label>
          <input
            className="input mt-1 text-left"
            dir="ltr"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="09xxxxxxxxx"
            required
            minLength={11}
            maxLength={11}
          />
        </div>
        {err && (
          <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{err}</div>
        )}
        <button disabled={busy} className="btn-primary w-full py-3">
          {busy ? "..." : "دریافت کد"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verifyOtp} className="card p-6 space-y-4">
      <div className="text-sm text-slate-600">
        کد ۶ رقمی ارسال‌شده به{" "}
        <span dir="ltr" className="font-mono">{phone}</span> را وارد کنید.
      </div>
      <div>
        <label className="text-sm font-medium">کد تایید</label>
        <input
          className="input mt-1 text-left text-center text-lg tracking-widest"
          dir="ltr"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="------"
          required
          minLength={6}
          maxLength={6}
        />
      </div>

      {mode === "register" && (
        <>
          <div>
            <label className="text-sm font-medium">نام (اختیاری)</label>
            <input
              className="input mt-1"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">صنف</label>
            <select
              className="input mt-1"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
            >
              <option value="">انتخاب کنید</option>
              {INDUSTRIES.map(i => (
                <option key={i.v} value={i.v}>{i.l}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {err && (
        <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{err}</div>
      )}
      <button disabled={busy} className="btn-primary w-full py-3">
        {busy ? "..." : "تایید و ورود"}
      </button>
      <button
        type="button"
        onClick={() => setStep("phone")}
        className="w-full text-xs text-slate-500"
      >
        تغییر شماره
      </button>
    </form>
  );
}