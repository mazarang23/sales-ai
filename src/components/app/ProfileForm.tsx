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

export function ProfileForm({ initial }: { initial: { name: string; industry: string; phone: string } }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [industry, setIndustry] = useState(initial.industry);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const r = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, industry })
      });
      if (!r.ok) throw new Error("خطا در ذخیره");
      setMsg("ذخیره شد");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-6 space-y-4">
      <div>
        <label className="text-sm font-medium">شماره موبایل (غیرقابل تغییر)</label>
        <input className="input mt-1 text-left" dir="ltr" value={initial.phone} disabled />
      </div>
      <div>
        <label className="text-sm font-medium">نام</label>
        <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium">صنف</label>
        <select className="input mt-1" value={industry} onChange={(e) => setIndustry(e.target.value)}>
          <option value="">انتخاب کنید</option>
          {INDUSTRIES.map((i) => (
            <option key={i.v} value={i.v}>{i.l}</option>
          ))}
        </select>
      </div>
      {msg && <div className="rounded-xl bg-slate-100 p-3 text-sm">{msg}</div>}
      <button disabled={loading} className="btn-primary w-full py-3">
        {loading ? "..." : "ذخیره تغییرات"}
      </button>
    </form>
  );
}