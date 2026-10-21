"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const KPIS = [
  { label: "فروش کل", value: "۱۸۲٬۵۰۰٬۰۰۰" },
  { label: "تعداد سفارش", value: "۱٬۲۴۵" },
  { label: "مشتری یکتا", value: "۸۷۶" },
  { label: "میانگین سبد", value: "۱۴۶٬۵۰۰" }
];

const SERIES = [
  { date: "1404/01/01", amount: 4200000 },
  { date: "1404/01/05", amount: 5100000 },
  { date: "1404/01/10", amount: 4800000 },
  { date: "1404/01/15", amount: 6200000 },
  { date: "1404/01/20", amount: 7100000 },
  { date: "1404/01/25", amount: 6800000 },
  { date: "1404/02/01", amount: 8200000 },
  { date: "1404/02/05", amount: 9100000 }
];

const TOP_PRODUCTS = [
  { name: "شلوار جین مردانه", amount: "۲۴٬۵۰۰٬۰۰۰" },
  { name: "تیشرت ساده", amount: "۱۸٬۲۰۰٬۰۰۰" },
  { name: "کفش اسپرت", amount: "۱۵٬۸۰۰٬۰۰۰" },
  { name: "کمربند چرم", amount: "۹٬۴۰۰٬۰۰۰" }
];

const SEGMENTS = [
  { name: "Champions", count: 128, color: "bg-emerald-50 text-emerald-700" },
  { name: "Loyal", count: 245, color: "bg-blue-50 text-blue-700" },
  { name: "Potential", count: 187, color: "bg-amber-50 text-amber-700" },
  { name: "AtRisk", count: 210, color: "bg-orange-50 text-orange-700" },
  { name: "Lost", count: 106, color: "bg-red-50 text-red-700" }
];

export function DemoDashboard() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
        ⓘ این یک دموی نمونه است. برای تحلیل داده‌های فروشگاه خودت، ثبت‌نام کن.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map(k => (
          <div key={k.label} className="card p-5">
            <div className="text-xs text-slate-500">{k.label}</div>
            <div className="mt-2 text-2xl font-black">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="font-bold mb-4">روند فروش</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SERIES}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => new Intl.NumberFormat("fa-IR").format(v)} />
              <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="font-bold mb-4">پرفروش‌ترین محصولات</div>
          <div className="space-y-2">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">#{i + 1}</span>
                  <span className="text-sm">{p.name}</span>
                </div>
                <span className="text-sm font-medium">{p.amount} تومان</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="font-bold mb-4">بخش‌بندی مشتریان (RFM)</div>
          <div className="grid grid-cols-2 gap-2">
            {SEGMENTS.map(s => (
              <div key={s.name} className={`rounded-xl p-3 ${s.color}`}>
                <div className="text-xs">{s.name}</div>
                <div className="text-lg font-bold">{s.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="font-bold mb-4">مشاور رشد (نمونه)</div>
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="font-semibold">کمپین بازگشت مشتریان غیرفعال</div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-2">
                <div className="text-slate-500">هزینه</div>
                <div className="font-medium mt-1">۲ تا ۵ میلیون</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <div className="text-slate-500">زمان</div>
                <div className="font-medium mt-1">۱ هفته</div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2">
                <div className="text-emerald-700">اثر</div>
                <div className="font-medium mt-1">+۱۵٪ فروش</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}