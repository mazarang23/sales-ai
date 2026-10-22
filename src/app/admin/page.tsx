import { db } from "@/lib/db";
import { formatMoney, formatNum, formatDate } from "@/lib/utils";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
  const now = new Date(); const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); const startOfYear = new Date(now.getFullYear(), 0, 1);
  const [usersCount, activeSubscriptions, paidBookingsCount, allBookingsCount, subsTotal, bookingsTotal, monthlySubs, monthlyBookings, yearlySubs, yearlyBookings, recentSubs, recentBookings, pendingSubsCount] = await Promise.all([
    db.user.count(),
    db.subscription.count({ where: { status: "paid", expiresAt: { gt: now } } }),
    db.booking.count({ where: { paymentStatus: "paid" } }),
    db.booking.count(),
    db.subscription.aggregate({ where: { status: "paid" }, _sum: { amount: true } }),
    db.booking.aggregate({ where: { paymentStatus: "paid" }, _sum: { amount: true } }),
    db.subscription.aggregate({ where: { status: "paid", paidAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    db.booking.aggregate({ where: { paymentStatus: "paid", paidAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    db.subscription.aggregate({ where: { status: "paid", paidAt: { gte: startOfYear } }, _sum: { amount: true } }),
    db.booking.aggregate({ where: { paymentStatus: "paid", paidAt: { gte: startOfYear } }, _sum: { amount: true } }),
    db.subscription.findMany({ where: { status: "paid" }, orderBy: { paidAt: "desc" }, take: 5, include: { user: { select: { phone: true, name: true } } } }),
    db.booking.findMany({ where: { paymentStatus: "paid" }, orderBy: { paidAt: "desc" }, take: 5, include: { user: { select: { phone: true } }, consultant: { select: { displayName: true } } } }),
    db.subscription.count({ where: { status: "pending" } })
  ]);
  const rial = (toman: number) => formatMoney(toman * 10, "rial");
  const subsRevenue = subsTotal._sum.amount ?? 0;
  const bookingsRevenue = bookingsTotal._sum.amount ?? 0;
  const totalRevenue = subsRevenue + bookingsRevenue;
  const monthlyRevenue = (monthlySubs._sum.amount ?? 0) + (monthlyBookings._sum.amount ?? 0);
  const yearlyRevenue = (yearlySubs._sum.amount ?? 0) + (yearlyBookings._sum.amount ?? 0);
  return <div className="space-y-6" dir="rtl"><div><h1 className="h2">داشبورد ادمین</h1><p className="muted mt-1 text-sm">خلاصه‌ای از وضعیت سیستم</p></div>
    {pendingSubsCount > 0 && <Link href="/admin/subscriptions" className="block rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{formatNum(pendingSubsCount)} پرداخت پلن در انتظار بررسی است ← مشاهده و تایید</Link>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Kpi label="درآمد کل" value={rial(totalRevenue)} hint="اشتراک + جلسات" /><Kpi label="درآمد ماه جاری" value={rial(monthlyRevenue)} /><Kpi label="درآمد سال جاری" value={rial(yearlyRevenue)} /><Kpi label="پلن‌های فعال" value={formatNum(activeSubscriptions)} /></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Kpi label="کل کاربران" value={formatNum(usersCount)} href="/admin/users" /><Kpi label="کل جلسات" value={formatNum(allBookingsCount)} href="/admin/bookings" /><Kpi label="جلسات پرداخت‌شده" value={formatNum(paidBookingsCount)} /><Kpi label="درآمد جلسات" value={rial(bookingsRevenue)} /></div>
    <div className="grid gap-6 lg:grid-cols-2"><div className="card p-6"><div className="flex items-center justify-between mb-4"><div className="font-bold">آخرین اشتراک‌ها</div><Link href="/admin/subscriptions" className="text-sm text-brand-600">پرداخت‌های در انتظار</Link></div>{recentSubs.length === 0 ? <div className="muted text-sm">تراکنشی نیست</div> : <div className="space-y-2">{recentSubs.map(s => <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"><div><div className="font-medium" dir="ltr">{s.user.phone}</div><div className="text-xs text-slate-500">پلن {s.plan} — {formatDate(s.paidAt)}</div></div><div className="text-sm font-medium">{rial(s.amount)}</div></div>)}</div>}</div>
      <div className="card p-6"><div className="flex items-center justify-between mb-4"><div className="font-bold">آخرین جلسات</div><Link href="/admin/bookings" className="text-sm text-brand-600">همه جلسات</Link></div>{recentBookings.length === 0 ? <div className="muted text-sm">جلسه‌ای نیست</div> : <div className="space-y-2">{recentBookings.map(b => <div key={b.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"><div><div className="font-medium" dir="ltr">{b.user.phone}</div><div className="text-xs text-slate-500">{b.consultant.displayName} — {formatDate(b.paidAt)}</div></div><div className="text-sm font-medium">{rial(b.amount)}</div></div>)}</div>}</div></div>
  </div>;
}
function Kpi({ label, value, hint, href }: { label: string; value: string; hint?: string; href?: string }) { const content = <><div className="text-xs text-slate-500">{label}</div><div className="mt-2 text-xl font-black">{value}</div>{hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}</>; return href ? <Link href={href} className="card p-5 hover:shadow-glow transition">{content}</Link> : <div className="card p-5">{content}</div>; }
