import Link from "next/link";
import { NotificationBell } from "@/components/app/NotificationBell";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEffectivePlan } from "@/lib/plans";
import { getProductBrand, type ProductBrand } from "@/lib/brand";

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

export async function AppHeader({ brand = "salesyar" }: { brand?: ProductBrand }) {
  const identity = getProductBrand(brand);
  const consultantBrand = brand === "moshaversho";
  const currentUser = await getCurrentUser();
  const user: User | null = currentUser
    ? { id: currentUser.id, phone: currentUser.phone || "", name: currentUser.name, role: currentUser.role, plan: currentUser.plan, planExpiresAt: currentUser.planExpiresAt }
    : null;
  const effectivePlan = user ? getEffectivePlan(user) : "free";
  const consultant: Consultant = user
    ? await db.consultant.findUnique({ where: { userId: user.id }, select: { id: true, status: true, displayName: true } })
    : null;

  const primaryLinkClass = consultantBrand
    ? "font-medium text-emerald-700 hover:text-emerald-800"
    : "font-medium text-blue-700 hover:text-blue-800";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur">
      <div className="container-tight flex min-h-14 flex-wrap items-center justify-between gap-2 py-2">
        <Link href={consultantBrand ? "/consultant/dashboard" : "/"} className="flex items-center gap-2 font-black" style={{ color: identity.accent }}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm text-white" style={{ backgroundColor: identity.primary }}>
            {consultantBrand ? "م" : "ف"}
          </span>
          <span>{identity.fullName}</span>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2 text-xs sm:gap-3 sm:text-sm">
          {user ? (
            <>
              {effectivePlan !== "free" && !consultantBrand && <span className="hidden rounded-lg bg-blue-50 px-2 py-1 text-xs text-blue-700 sm:inline-flex">پلن {PLAN_LABELS[effectivePlan] || effectivePlan}</span>}
              {consultantBrand ? (
                <>
                  <Link href="/consultant/dashboard" className={primaryLinkClass}>پیشخوان</Link>
                  <Link href="/consultant/bookings" className={primaryLinkClass}>جلسات</Link>
                  <Link href="/consultant/availability" className={primaryLinkClass}>زمان‌های کاری</Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="text-slate-600 hover:text-blue-700">داشبورد</Link>
                  <Link href="/upload" className="text-slate-600 hover:text-blue-700">آپلود</Link>
                  <Link href="/bookings" className="text-slate-600 hover:text-blue-700">جلسات</Link>
                  <Link href="/account" className="font-medium text-slate-600 hover:text-blue-700">حساب من</Link>
                  {consultant && <Link href="/consultant/dashboard" className="font-medium text-emerald-700">پنل مشاور</Link>}
                </>
              )}
              {user.role === "ADMIN" && <Link href="/admin" className={primaryLinkClass}>ادمین</Link>}
              <NotificationBell />
              <form action="/api/auth/logout" method="post"><button className="btn-ghost text-sm text-red-600">خروج</button></form>
            </>
          ) : (
            <>
              <Link href={consultantBrand ? "/consultant/login" : "/login"} className="btn-ghost text-sm">ورود</Link>
              <Link
                href={consultantBrand ? "/consultant/register" : "/register"}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition"
                style={{ backgroundColor: identity.primary }}
              >
                {consultantBrand ? "ثبت‌نام مشاور" : "شروع رایگان"}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
