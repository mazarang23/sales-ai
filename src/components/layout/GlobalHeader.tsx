"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NotificationBell } from "@/components/app/NotificationBell";

type User = { id: string; phone: string; name: string | null; role: string; plan: string };
type Consultant = { id: string; status: string; displayName: string } | null;

export function GlobalHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [consultant, setConsultant] = useState<Consultant>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(j => {
        setUser(j.user || null);
        setConsultant(j.consultant || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="container-tight flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-lg">
          <span className="inline-block h-7 w-7 rounded-lg bg-brand-600 text-white text-center leading-7">ف</span>
          فروشیار AI
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700">
          <Link href="/#features" className="hover:text-brand-700">ویژگی‌ها</Link>
          <Link href="/consultants" className="hover:text-brand-700">مشاورین</Link>
          <Link href="/pricing" className="hover:text-brand-700">تعرفه</Link>
          <Link href="/blog" className="hover:text-brand-700">وبلاگ</Link>
          <Link href="/about" className="hover:text-brand-700">درباره</Link>
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-sm text-slate-400">...</span>
          ) : user ? (
            <>
              <Link href="/dashboard" className="hidden sm:inline-flex btn-ghost text-sm">داشبورد</Link>
              <Link href="/account" className="hidden sm:inline-flex btn-ghost text-sm">حساب من</Link>
              {consultant ? (
                <Link href="/consultant/dashboard" className="hidden sm:inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition">
                  پنل مشاور
                </Link>
              ) : (
                <Link href="/consultant/register" className="hidden sm:inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition">
                  مشاور شو
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link href="/admin" className="hidden sm:inline-flex btn-ghost text-sm text-brand-700">ادمین</Link>
              )}
              <NotificationBell />
              <form action="/api/auth/logout" method="post">
                <button className="btn-ghost text-sm text-red-600">خروج</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/consultant/register" className="hidden sm:inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition">
                مشاور شو
              </Link>
              <Link href="/login" className="btn-ghost text-sm">ورود</Link>
              <Link href="/register" className="btn-primary text-sm">شروع رایگان</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}