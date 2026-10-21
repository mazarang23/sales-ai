"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConsultantRegisterForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
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
      const r = await fetch("/api/consultant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          bio,
          photoUrl,
          linkedin,
          instagram,
          hourlyRate: Number(hourlyRate)
        })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-6 space-y-4">
      <div>
        <label className="text-sm font-medium">نام نمایشی</label>
        <input className="input mt-1" value={displayName} onChange={e => setDisplayName(e.target.value)} required minLength={3} />
      </div>
      <div>
        <label className="text-sm font-medium">بیوگرافی (حداقل ۲۰ کاراکتر)</label>
        <textarea className="input mt-1 h-32" value={bio} onChange={e => setBio(e.target.value)} required minLength={20} />
      </div>
      <div>
        <label className="text-sm font-medium">لینک عکس پروفایل (اختیاری)</label>
        <input className="input mt-1 text-left" dir="ltr" type="url" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://..." />
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
      {error && <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
      <button disabled={busy} className="btn-primary w-full py-3">
        {busy ? "در حال ارسال..." : "ارسال درخواست"}
      </button>
    </form>
  );
}