"use client";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { Period, periodKey, periodLabel } from "@/lib/analytics/periods";

type Row = { date: string | null; amount: number };

export function SalesChart({ rows }: { rows: Row[] }) {
  const [period, setPeriod] = useState<Period>("day");

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
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v: any) => new Intl.NumberFormat("fa-IR").format(v)}
              labelFormatter={(l: any) => l}
            />
            <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}