"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NotificationBell } from "@/components/app/NotificationBell";

type User = { id: string; phone: string; name: string | null; role: string; plan: string };
type Consultant = { id: string; status: string; displayName: string } | null;

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [consultant, setConsultant] = useState<Consultant>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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
      <div className="container-tight flex h-14 sm:h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-base sm:text-lg">
          <span className="inline-block h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-brand-600 text-white text-center leading-6 sm:leading-7 text-sm sm:text-base">ف</span>
          فروشیار AI
        </Link>

        {/* منوی دسکتاپ */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700">
          <Link href="/#features" className="hover:text-brand-700">ویژگی‌ها</Link>
          <Link href="/consultants" className="hover:text-brand-700">مشاورین</Link>
          <Link href="/pricing" className="hover:text-brand-700">تعرفه</Link>
          <Link href="/blog" className="hover:text-brand-700">وبلاگ</Link>
          <Link href="/about" className="hover:text-brand-700">درباره</Link>
        </nav>

        {/* دکمه‌های دسکتاپ */}
        <div className="hidden md:flex items-center gap-2">
          {loading ? (
            <span className="text-sm text-slate-400">...</span>
          ) : user ? (
            <>
              <Link href="/dashboard" className="btn-ghost text-sm">داشبورد</Link>
              <Link href="/account" className="btn-ghost text-sm">حساب من</Link>
              {consultant && (
                <Link href="/consultant/dashboard" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition">
                  پنل مشاور
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link href="/admin" className="btn-ghost text-sm text-brand-700">ادمین</Link>
              )}
              <NotificationBell />
              <form action="/api/auth/logout" method="post">
                <button className="btn-ghost text-sm text-red-600">خروج</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/consultant/register" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition">
                مشاور شو
              </Link>
              <Link href="/login" className="btn-ghost text-sm">ورود</Link>
              <Link href="/register" className="btn-primary text-sm">شروع رایگان</Link>
            </>
          )}
        </div>

        {/* دکمه منوی موبایل */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100"
          aria-label="منو"
        >
          <span className="text-xl">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* منوی موبایل */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <Link href="/#features" onClick={() => setMenuOpen(false)} className="block py-2 text-sm">ویژگی‌ها</Link>
          <Link href="/consultants" onClick={() => setMenuOpen(false)} className="block py-2 text-sm">مشاورین</Link>
          <Link href="/pricing" onClick={() => setMenuOpen(false)} className="block py-2 text-sm">تعرفه</Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)} className="block py-2 text-sm">وبلاگ</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} className="block py-2 text-sm">درباره</Link>
          <div className="border-t border-slate-100 pt-2 mt-2 space-y-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-sm">داشبورد</Link>
                <Link href="/account" onClick={() => setMenuOpen(false)} className="block py-2 text-sm">حساب من</Link>
                {consultant && (
                  <Link href="/consultant/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-emerald-700">پنل مشاور</Link>
                )}
                {user.role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-brand-700">ادمین</Link>
                )}
                <form action="/api/auth/logout" method="post">
                  <button className="block w-full text-right py-2 text-sm text-red-600">خروج</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/consultant/register" onClick={() => setMenuOpen(false)} className="block w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white text-center">مشاور شو</Link>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block w-full btn-ghost text-sm text-center">ورود</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="block w-full btn-primary text-sm text-center">شروع رایگان</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}