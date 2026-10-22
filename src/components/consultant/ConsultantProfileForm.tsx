"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConsultantProfileForm({ initial }: {
  initial: {
    phone: string | null;
    displayName: string;
    bio: string;
    linkedin: string | null;
    instagram: string | null;
    hourlyRate: number;
  };
}) {
  const router = useRouter();
  const [phone, setPhone] = useState(initial.phone || "");
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [bio, setBio] = useState(initial.bio);
  const [linkedin, setLinkedin] = useState(initial.linkedin || "");
  const [instagram, setInstagram] = useState(initial.instagram || "");
  const [hourlyRate, setHourlyRate] = useState(initial.hourlyRate ? String(initial.hourlyRate) : "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/consultant/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, displayName, bio, linkedin, instagram, hourlyRate: Number(hourlyRate) })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      setMsg("پروفایل با موفقیت ذخیره شد.");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "خطا در ذخیره پروفایل");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">شماره موبایل</label>
          <input className="input mt-1 text-left" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} placeholder="09xxxxxxxxx" required minLength={11} maxLength={11} />
        </div>
        <div>
          <label className="text-sm font-medium">نام نمایشی</label>
          <input className="input mt-1" value={displayName} onChange={e => setDisplayName(e.target.value)} required minLength={3} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">بیوگرافی</label>
        <textarea className="input mt-1 h-28" value={bio} onChange={e => setBio(e.target.value)} required minLength={20} placeholder="حداقل ۲۰ کاراکتر" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">لینکدین</label>
          <input className="input mt-1 text-left" dir="ltr" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
        </div>
        <div>
          <label className="text-sm font-medium">اینستاگرام</label>
          <input className="input mt-1 text-left" dir="ltr" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">تعرفه ساعتی (تومان)</label>
        <input className="input mt-1 text-left" dir="ltr" type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} required min={50000} step={10000} />
      </div>
      {msg && <div className="rounded-xl bg-slate-100 p-3 text-sm">{msg}</div>}
      <button disabled={busy} className="btn-primary w-full py-3">{busy ? "در حال ذخیره..." : "ذخیره پروفایل"}</button>
    </form>
  );
}
