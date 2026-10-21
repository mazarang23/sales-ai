"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NotificationBell } from "@/components/app/NotificationBell";

type User = {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  plan: string;
};
type Consultant = { id: string; status: string; displayName: string } | null;

const PLAN_LABELS: Record<string, string> = {
  free: "رایگان",
  pro: "رشد",
  business: "حرفه‌ای"
};

export function AppHeader() {
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
      <div className="container-tight flex h-14 items-center justify-between">
        <Link href="/" className="font-black">فروشیار AI</Link>

        <div className="flex items-center gap-3 text-sm">
          {loading ? (
            <span className="text-slate-400">...</span>
          ) : user ? (
            <>
              {user.plan !== "free" && (
                <span className="hidden sm:inline-flex rounded-lg bg-emerald-50 text-emerald-700 px-2 py-1 text-xs">
                  پلن {PLAN_LABELS[user.plan] || user.plan}
                </span>
              )}
              <Link href="/dashboard" className="text-slate-600 hover:text-brand-600">داشبورد</Link>
              <Link href="/bookings" className="text-slate-600 hover:text-brand-600">جلسات</Link>
              <Link href="/account" className="text-slate-600 hover:text-brand-600 font-medium">حساب من</Link>
              {consultant && (
                <Link href="/consultant/dashboard" className="text-emerald-700 font-medium">
                  پنل مشاور
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link href="/admin" className="text-brand-600">ادمین</Link>
              )}
              <NotificationBell />
              <form action="/api/auth/logout" method="post">
                <button className="btn-ghost text-sm text-red-600">خروج</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm">ورود</Link>
              <Link href="/register" className="btn-primary text-sm">ثبت‌نام</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}