
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "ورود انجام نشد.");
        return;
      }

      router.replace(
        data.role === "ADMIN" ? "/admin" : "/dashboard"
      );
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کن.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div>
        <label htmlFor="phone" className="text-sm font-medium">
          نام کاربری (شماره موبایل)
        </label>
        <input
          id="phone"
          name="username"
          className="input mt-1 text-left"
          dir="ltr"
          type="tel"
          autoComplete="username"
          inputMode="numeric"
          placeholder="09123456789"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          pattern="09[0-9]{9}"
          minLength={11}
          maxLength={11}
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium">
          رمز عبور
        </label>
        <input
          id="password"
          name="password"
          className="input mt-1"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3"
      >
        {loading ? "در حال ورود..." : "ورود"}
      </button>
    </form>
  );
}
