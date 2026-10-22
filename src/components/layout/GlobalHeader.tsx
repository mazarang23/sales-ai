"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NotificationBell } from "@/components/app/NotificationBell";

type User = { id: string; phone: string; name: string | null; role: string; plan: string };
type Consultant = { id: string; status: string; displayName: string } | null;

export function GlobalHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [consultant, setConsultant] = useState<Consultant>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(j => { if (active) { setUser(j.user || null); setConsultant(j.consultant || null); } })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const navLinks = [
    ["/#features", "ویژگی‌ها"], ["/consultants", "مشاورین"],
    ["/pricing", "تعرفه"], ["/blog", "وبلاگ"], ["/about", "درباره"]
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur">
      <div className="container-tight flex min-h-16 items-center justify-between gap-3 py-2">
        <Link href="/" onClick={() => setMenuOpen(false)} className="flex shrink-0 items-center gap-2 font-black text-lg">
          <span className="inline-block h-8 w-8 rounded-lg bg-brand-600 text-white text-center leading-8">ف</span>
          <span>فروشیار AI</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 text-sm text-slate-700">
          {navLinks.map(([href, title]) => <Link key={href} href={href} className="whitespace-nowrap hover:text-brand-700">{title}</Link>)}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {loading ? <span className="h-9 w-16 animate-pulse rounded-lg bg-slate-100" /> : user ? (
            <>
              <Link href="/dashboard" className="btn-ghost text-sm">داشبورد</Link>
              <Link href="/account" className="hidden lg:inline-flex btn-ghost text-sm">حساب من</Link>
              {consultant && <Link href="/consultant/dashboard" className="rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">پنل مشاور</Link>}
              {!consultant && <Link href="/consultant/register" className="hidden lg:inline-flex rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">مشاور شو</Link>}
              {user.role === "ADMIN" && <Link href="/admin" className="btn-ghost text-sm text-brand-700">ادمین</Link>}
              <NotificationBell />
              <form action="/api/auth/logout" method="post"><button className="btn-ghost text-sm text-red-600">خروج</button></form>
            </>
          ) : (
            <>
              <Link href="/consultant/register" className="hidden lg:inline-flex rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">مشاور شو</Link>
              <Link href="/login" className="btn-ghost text-sm">ورود</Link>
              <Link href="/register" className="btn-primary text-sm">شروع رایگان</Link>
            </>
          )}
        </div>

        <button type="button" aria-label={menuOpen ? "بستن منو" : "باز کردن منو"} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && <div className="border-t border-slate-100 bg-white px-4 py-3 shadow-lg md:hidden">
        <nav className="grid gap-1">
          {navLinks.map(([href, title]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-slate-700 hover:bg-slate-50">{title}</Link>)}
          {loading ? <div className="px-3 py-3 text-sm text-slate-400">در حال بررسی حساب…</div> : user ? <>
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm hover:bg-slate-50">داشبورد</Link>
            <Link href="/account" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm hover:bg-slate-50">حساب من</Link>
            {consultant && <Link href="/consultant/dashboard" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-emerald-700 hover:bg-slate-50">پنل مشاور</Link>}
            {!consultant && <Link href="/consultant/register" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-emerald-700 hover:bg-slate-50">مشاور شو</Link>}
            {user.role === "ADMIN" && <Link href="/admin" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-brand-700 hover:bg-slate-50">ادمین</Link>}
            <form action="/api/auth/logout" method="post" className="p-2"><button className="btn-ghost w-full text-sm text-red-600">خروج از حساب</button></form>
          </> : <>
            <Link href="/consultant/register" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-emerald-700 hover:bg-slate-50">مشاور شو</Link>
            <div className="grid grid-cols-2 gap-2 p-2"><Link href="/login" onClick={() => setMenuOpen(false)} className="btn-ghost">ورود</Link><Link href="/register" onClick={() => setMenuOpen(false)} className="btn-primary">شروع رایگان</Link></div>
          </>}
        </nav>
      </div>}
    </header>
  );
}
