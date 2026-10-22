"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConsultantRegisterForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/consultant/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          password,
          displayName,
          bio,
          linkedin,
          instagram,
          hourlyRate: Number(hourlyRate)
        })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      router.push("/consultant/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="card p-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">شماره موبایل</label>
            <input className="input mt-1 text-left" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} placeholder="09xxxxxxxxx" required minLength={11} maxLength={11} />
          </div>
          <div>
            <label className="text-sm font-medium">رمز عبور (حداقل ۶ کاراکتر)</label>
            <input className="input mt-1" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">نام نمایشی</label>
          <input className="input mt-1" value={displayName} onChange={e => setDisplayName(e.target.value)} required minLength={3} />
        </div>
        <div>
          <label className="text-sm font-medium">بیوگرافی (حداقل ۲۰ کاراکتر)</label>
          <textarea className="input mt-1 h-32" value={bio} onChange={e => setBio(e.target.value)} required minLength={20} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">لینکدین (اختیاری)</label>
            <input className="input mt-1 text-left" dir="ltr" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className="text-sm font-medium">اینستاگرام (اختیاری)</label>
            <input className="input mt-1 text-left" dir="ltr" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">تعرفه ساعتی (تومان)</label>
          <input className="input mt-1 text-left" dir="ltr" type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} required min={50000} step={10000} />
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">بعد از ثبت‌نام می‌توانی از پنل مشاور، عکس پروفایلت را آپلود کنی.</div>
        {error && <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
        <button disabled={busy} className="btn-primary w-full py-3">{busy ? "در حال ارسال..." : "ثبت‌نام و ادامه"}</button>
      </form>

      <div className="relative py-1 text-center text-xs text-slate-400">
        <span className="relative z-10 bg-white px-3">یا</span>
        <div className="absolute inset-x-0 top-1/2 border-t border-slate-200" />
      </div>

      <a
        href="/api/auth/google?kind=consultant"
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span className="text-base font-bold">G</span>
        ثبت‌نام با حساب Google
      </a>
    </div>
  );
}