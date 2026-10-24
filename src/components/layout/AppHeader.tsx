import Link from "next/link";
import { NotificationBell } from "@/components/app/NotificationBell";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEffectivePlan } from "@/lib/plans";

type User = {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  plan: string;
  planExpiresAt: Date | null;
};
type Consultant = { id: string; status: string; displayName: string } | null;

const PLAN_LABELS: Record<string, string> = { free: "رایگان", pro: "رشد", business: "حرفه‌ای" };

export async function AppHeader() {
  const currentUser = await getCurrentUser();
  const user: User | null = currentUser
    ? { id: currentUser.id, phone: currentUser.phone || "", name: currentUser.name, role: currentUser.role, plan: currentUser.plan, planExpiresAt: currentUser.planExpiresAt }
    : null;
  const effectivePlan = user ? getEffectivePlan(user) : "free";
  const consultant: Consultant = user
    ? await db.consultant.findUnique({ where: { userId: user.id }, select: { id: true, status: true, displayName: true } })
    : null;
  return <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur"><div className="container-tight flex min-h-14 flex-wrap items-center justify-between gap-2 py-2"><Link href="/" className="font-black">فروشیار AI</Link><div className="flex flex-wrap items-center justify-end gap-2 text-xs sm:gap-3 sm:text-sm">{user ? <><>{effectivePlan !== "free" && <span className="hidden sm:inline-flex rounded-lg bg-emerald-50 text-emerald-700 px-2 py-1 text-xs">پلن {PLAN_LABELS[effectivePlan] || effectivePlan}</span>}</><Link href="/dashboard" className="text-slate-600 hover:text-brand-600">داشبورد</Link><Link href="/upload" className="text-slate-600 hover:text-brand-600">آپلود</Link><Link href="/bookings" className="text-slate-600 hover:text-brand-600">جلسات</Link><Link href="/account" className="text-slate-600 hover:text-brand-600 font-medium">حساب من</Link>{consultant && <Link href="/consultant/dashboard" className="text-emerald-700 font-medium">پنل مشاور</Link>}{user.role === "ADMIN" && <Link href="/admin" className="text-brand-600">ادمین</Link>}<NotificationBell /><form action="/api/auth/logout" method="post"><button className="btn-ghost text-sm text-red-600">خروج</button></form></> : <><Link href="/login" className="btn-ghost text-sm">ورود</Link><Link href="/register" className="btn-primary text-sm">ثبت‌نام</Link></>}</div></div></header>;
}
