"use client";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { Period, periodKey, periodLabel } from "@/lib/analytics/periods";

type Row = { date: string | null; amount: number };

export function SalesChart({ rows }: { rows: Row[] }) {
  const [period, setPeriod] = useState<Period>("month");

  const series = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      if (!r.date) continue;
      const key = periodKey(new Date(r.date), period);
      map.set(key, (map.get(key) ?? 0) + r.amount);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, amount]) => ({ key, amount, label: periodLabel(key, period) }));
  }, [rows, period]);

  if (series.length === 0) {
    return <div className="muted text-sm">داده‌ای برای نمودار نیست</div>;
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-sm">
          {([
            { v: "day", l: "روزانه" },
            { v: "week", l: "هفتگی" },
            { v: "month", l: "ماهانه" }
          ] as { v: Period; l: string }[]).map(o => (
            <button
              key={o.v}
              onClick={() => setPeriod(o.v)}
              className={`rounded-lg px-3 py-1 transition ${
                period === o.v ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72 rounded-2xl border border-slate-100 bg-white p-2 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} barCategoryGap={series.length > 18 ? "8%" : series.length > 10 ? "18%" : "32%"} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={28} height={38} />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={58} tickMargin={8} tickFormatter={(v: number) => new Intl.NumberFormat("fa-IR", { notation: "compact", maximumFractionDigits: 1 }).format(v)} />
            <Tooltip
              formatter={(v: any) => [new Intl.NumberFormat("fa-IR").format(Number(v)), "مبلغ فروش"]}
              labelFormatter={(l: any) => "دوره: " + l}
            />
            <Bar dataKey="amount" fill="#3b82f6" radius={[5, 5, 0, 0]} maxBarSize={series.length > 18 ? 18 : series.length > 10 ? 28 : 42} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}