import { db } from "@/lib/db";
import { formatIRR } from "@/lib/utils";
import { RevenueChart } from "@/components/admin/RevenueChart";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [paidSubs, paidBookings] = await Promise.all([
    db.subscription.findMany({
      where: { status: "paid", paidAt: { gte: twelveMonthsAgo } },
      select: { paidAt: true, amount: true }
    }),
    db.booking.findMany({
      where: { paymentStatus: "paid", paidAt: { gte: twelveMonthsAgo } },
      select: { paidAt: true, amount: true }
    })
  ]);

  const monthMap = new Map<string, number>();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, 0);
  }
  for (const s of paidSubs) {
    if (!s.paidAt) continue;
    const key = `${s.paidAt.getFullYear()}-${String(s.paidAt.getMonth() + 1).padStart(2, "0")}`;
    if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) || 0) + s.amount);
  }
  for (const b of paidBookings) {
    if (!b.paidAt) continue;
    const key = `${b.paidAt.getFullYear()}-${String(b.paidAt.getMonth() + 1).padStart(2, "0")}`;
    if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) || 0) + b.amount);
  }

  const monthNames = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
  ];
  const chartData = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, revenue]) => {
      const [year, month] = key.split("-");
      return { month: `${monthNames[parseInt(month) - 1]} ${year}`, revenue };
    });

  const totalRevenue = [...monthMap.values()].reduce((s, v) => s + v, 0);

  const byPlan = new Map<string, number>();
  for (const s of paidSubs) {
    const plan =
      s.amount === 4900000 ? "حرفه‌ای" : s.amount === 890000 ? "رشد" : "سایر";
    byPlan.set(plan, (byPlan.get(plan) || 0) + s.amount);
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="h2">گزارش درآمد</h1>
        <p className="muted mt-1 text-sm">نمای کلی درآمد ۱۲ ماه اخیر</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs text-slate-500">کل درآمد ۱۲ ماه</div>
          <div className="mt-2 text-xl font-black">{formatIRR(totalRevenue)}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500">درآمد اشتراک</div>
          <div className="mt-2 text-xl font-black">
            {formatIRR(paidSubs.reduce((s, x) => s + x.amount, 0))}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500">درآمد جلسات</div>
          <div className="mt-2 text-xl font-black">
            {formatIRR(paidBookings.reduce((s, x) => s + x.amount, 0))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="font-bold mb-4">درآمد ماهانه</div>
        <RevenueChart data={chartData} />
      </div>

      <div className="card p-6">
        <div className="font-bold mb-4">درآمد اشتراک به تفکیک پلن</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[...byPlan.entries()].map(([plan, revenue]) => (
            <div key={plan} className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">{plan}</div>
              <div className="mt-1 text-lg font-bold">{formatIRR(revenue)}</div>
            </div>
          ))}
          {byPlan.size === 0 && (
            <div className="muted text-sm col-span-3">داده‌ای نیست</div>
          )}
        </div>
      </div>
    </div>
  );
}