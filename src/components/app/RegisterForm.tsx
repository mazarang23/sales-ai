"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/i18n";

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

export function RegisterForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, password, industry })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || T.common.error);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : T.common.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-6 space-y-4">
      <div>
        <label className="text-sm font-medium">{T.register.phone}</label>
        <input
          className="input mt-1 text-left"
          dir="ltr"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="09xxxxxxxxx"
          required
          minLength={11}
          maxLength={11}
        />
      </div>
      <div>
        <label className="text-sm font-medium">{T.register.name}</label>
        <input
          className="input mt-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">{T.register.password}</label>
        <input
          className="input mt-1"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <div>
        <label className="text-sm font-medium">{T.register.industry}</label>
        <select
          className="input mt-1"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          required
        >
          <option value="">{T.register.industryPlaceholder}</option>
          {INDUSTRIES.map((i) => (
            <option key={i.v} value={i.v}>{i.l}</option>
          ))}
        </select>
      </div>
      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</div>
      )}
      <button disabled={loading} className="btn-primary w-full py-3">
        {loading ? T.register.submitting : T.register.submit}
      </button>
      <p className="text-center text-sm text-slate-500">
        {T.register.haveAccount}{" "}
        <a href="/login" className="text-brand-600">{T.register.loginLink}</a>
      </p>
    </form>
  );
}