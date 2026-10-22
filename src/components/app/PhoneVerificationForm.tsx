"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PhoneVerificationForm({ kind }: { kind: "customer" | "consultant" }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function continueWithoutVerification() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/save-unverified-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, kind })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "ذخیره شماره انجام نشد");
      router.push(kind === "consultant" ? "/consultant/dashboard" : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره شماره انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/snd-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "ارسال کد انجام نشد");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارسال کد");
    } finally {
      setBusy(false);
    }
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "کد تأیید نشد");

      if (kind === "consultant") {
        const linked = await fetch("/api/consultant/link-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone })
        });
        const linkResult = await linked.json();
        if (!linked.ok) throw new Error(linkResult.error || "پیوند حساب انجام نشد");
        router.push("/consultant/dashboard");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در تأیید شماره");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={verify} className="card p-6 space-y-4">
      <div>
        <label className="text-sm font-medium">شماره موبایل</label>
        <input className="input mt-1 text-left" dir="ltr" value={phone} onChange={event => setPhone(event.target.value)} placeholder="09xxxxxxxxx" required minLength={11} maxLength={11} pattern="09[0-9]{9}" />
      </div>
      {sent && <div>
        <label className="text-sm font-medium">کد پیامک‌شده</label>
        <input className="input mt-1 text-left tracking-widest" dir="ltr" value={code} onChange={event => setCode(event.target.value)} placeholder="کد ۶ رقمی" required minLength={6} maxLength={6} inputMode="numeric" />
      </div>}
      {error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="flex flex-col gap-2 sm:flex-row">
        {!sent ? <>
          <button type="button" onClick={send} disabled={busy} className="btn-primary flex-1">{busy ? "در حال ارسال…" : "ارسال کد تأیید"}</button>
          <button type="button" onClick={continueWithoutVerification} disabled={busy} className="btn-ghost flex-1">{busy ? "در حال ذخیره…" : "فعلاً بدون تأیید ادامه می‌دهم"}</button>
        </> : <>
          <button type="submit" disabled={busy} className="btn-primary flex-1">{busy ? "در حال بررسی…" : "تأیید شماره و ادامه"}</button>
          <button type="button" onClick={send} disabled={busy} className="btn-ghost">{busy ? "در حال ارسال…" : "ارسال دوباره"}</button>
        </>}
      </div>
      <p className="text-xs leading-6 text-slate-500">می‌توانی فعلاً بدون تأیید پیامکی ادامه بدهی؛ در این حالت شماره فقط ثبت می‌شود و تأییدشده محسوب نمی‌شود. برای استفاده از شماره به‌عنوان شماره تأییدشده، باید OTP را وارد کنی. اگر شماره قبلاً به حساب دیگری متصل باشد، اتصال رد می‌شود.</p>
    </form>
  );
}
