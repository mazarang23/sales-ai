"use client";
import { useState } from "react";
import { CohortTable } from "./CohortTable";
import { CohortRow } from "@/lib/analytics/cohort";
import { Period } from "@/lib/analytics/periods";

export function CohortSection({
  cohortsByPeriod
}: {
  cohortsByPeriod: Record<Period, CohortRow[]>;
}) {
  const [period, setPeriod] = useState<Period>("month");

  const options: { v: Period; l: string }[] = [
    { v: "day", l: "روزانه" },
    { v: "week", l: "هفتگی" },
    { v: "month", l: "ماهانه" }
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="font-bold">تحلیل کوهورت</div>
          <div className="muted text-sm mt-1">
            رفتار مشتریان بر اساس اولین خریدشان
          </div>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-sm">
          {options.map(o => (
            <button
              key={o.v}
              onClick={() => setPeriod(o.v)}
              className={`rounded-lg px-3 py-1 transition ${
                period === o.v
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>
      <CohortTable cohorts={cohortsByPeriod[period] || []} period={period} />
    </div>
  );
}