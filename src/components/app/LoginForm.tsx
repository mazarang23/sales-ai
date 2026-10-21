"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      router.push(j.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-6 space-y-4">
      <div>
        <label className="text-sm font-medium">شماره موبایل</label>
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
        <label className="text-sm font-medium">رمز عبور</label>
        <input
          className="input mt-1"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</div>
      )}
      <button disabled={loading} className="btn-primary w-full py-3">
        {loading ? "در حال ورود..." : "ورود"}
      </button>
      <p className="text-center text-sm text-slate-500">
        حساب ندارید؟ <a href="/register" className="text-brand-600">ثبت‌نام کنید</a>
      </p>
    </form>
  );
}