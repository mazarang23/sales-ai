import { db } from "@/lib/db";
import { formatIRR, formatNum, formatDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    usersCount,
    activeSubscriptions,
    paidBookingsCount,
    allBookingsCount,
    paidSubs,
    paidBookings,
    recentSubs,
    recentBookings
  ] = await Promise.all([
    db.user.count(),
    db.subscription.count({
      where: { status: "paid", expiresAt: { gt: now } }
    }),
    db.booking.count({ where: { paymentStatus: "paid" } }),
    db.booking.count(),
    db.subscription.findMany({ where: { status: "paid" } }),
    db.booking.findMany({ where: { paymentStatus: "paid" } }),
    db.subscription.findMany({
      where: { status: "paid" },
      orderBy: { paidAt: "desc" },
      take: 5,
      include: { user: { select: { phone: true, name: true } } }
    }),
    db.booking.findMany({
      where: { paymentStatus: "paid" },
      orderBy: { paidAt: "desc" },
      take: 5,
      include: {
        user: { select: { phone: true } },
        consultant: { select: { displayName: true } }
      }
    })
  ]);

  const subsRevenue = paidSubs.reduce((s, sub) => s + sub.amount, 0);
  const bookingsRevenue = paidBookings.reduce((s, b) => s + b.amount, 0);
  const totalRevenue = subsRevenue + bookingsRevenue;

  const monthlySubs = paidSubs.filter(s => s.paidAt && s.paidAt >= startOfMonth);
  const monthlyBookings = paidBookings.filter(b => b.paidAt && b.paidAt >= startOfMonth);
  const monthlyRevenue =
    monthlySubs.reduce((s, x) => s + x.amount, 0) +
    monthlyBookings.reduce((s, x) => s + x.amount, 0);

  const yearlySubs = paidSubs.filter(s => s.paidAt && s.paidAt >= startOfYear);
  const yearlyBookings = paidBookings.filter(b => b.paidAt && b.paidAt >= startOfYear);
  const yearlyRevenue =
    yearlySubs.reduce((s, x) => s + x.amount, 0) +
    yearlyBookings.reduce((s, x) => s + x.amount, 0);

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="h2">داشبورد ادمین</h1>
        <p className="muted mt-1 text-sm">خلاصه‌ای از وضعیت سیستم</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="درآمد کل" value={formatIRR(totalRevenue)} hint="اشتراک + جلسات" />
        <Kpi label="درآمد ماه جاری" value={formatIRR(monthlyRevenue)} />
        <Kpi label="درآمد سال جاری" value={formatIRR(yearlyRevenue)} />
        <Kpi label="پلن‌های فعال" value={formatNum(activeSubscriptions)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="کل کاربران" value={formatNum(usersCount)} href="/admin/users" />
        <Kpi label="کل جلسات" value={formatNum(allBookingsCount)} href="/admin/bookings" />
        <Kpi label="جلسات پرداخت‌شده" value={formatNum(paidBookingsCount)} />
        <Kpi label="درآمد جلسات" value={formatIRR(bookingsRevenue)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold">آخرین اشتراک‌ها</div>
            <Link href="/admin/bookings" className="text-sm text-brand-600">
              همه تراکنش‌ها
            </Link>
          </div>
          {recentSubs.length === 0 ? (
            <div className="muted text-sm">تراکنشی نیست</div>
          ) : (
            <div className="space-y-2">
              {recentSubs.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <div>
                    <div className="font-medium" dir="ltr">{s.user.phone}</div>
                    <div className="text-xs text-slate-500">
                      پلن {s.plan} — {formatDate(s.paidAt)}
                    </div>
                  </div>
                  <div className="text-sm font-medium">{formatIRR(s.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold">آخرین جلسات</div>
            <Link href="/admin/bookings" className="text-sm text-brand-600">
              همه جلسات
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="muted text-sm">جلسه‌ای نیست</div>
          ) : (
            <div className="space-y-2">
              {recentBookings.map(b => (
                <div key={b.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <div>
                    <div className="font-medium" dir="ltr">{b.user.phone}</div>
                    <div className="text-xs text-slate-500">
                      {b.consultant.displayName} — {formatDate(b.paidAt)}
                    </div>
                  </div>
                  <div className="text-sm font-medium">{formatIRR(b.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  href
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-black">{value}</div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="card p-5 hover:shadow-glow transition">
        {content}
      </Link>
    );
  }
  return <div className="card p-5">{content}</div>;
}