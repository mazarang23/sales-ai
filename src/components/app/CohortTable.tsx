import { CohortRow } from "@/lib/analytics/cohort";
import { Period, periodLabel } from "@/lib/analytics/periods";

export function CohortTable({ cohorts, period }: { cohorts: CohortRow[]; period: Period }) {
  if (!Array.isArray(cohorts) || cohorts.length === 0) {
    return <div className="muted py-4 text-sm">داده‌ای برای تحلیل کوهورت موجود نیست. مطمئن شوید شناسه مشتری و تاریخ خرید در فایل وجود دارد.</div>;
  }

  const totalPeriods = Math.max(...cohorts.map(c => c.periods?.length || 0));
  const label = period === "day" ? "روز" : period === "week" ? "هفته" : "ماه";
  const recentCohorts = [...cohorts].reverse();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>هر خانه = درصد مشتریان همان کوهورت که در آن دوره دوباره خرید کرده‌اند.</span>
        <span>{cohorts.length.toLocaleString("fa-IR")} کوهورت · {totalPeriods.toLocaleString("fa-IR")} دوره در افق داده</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-max w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="sticky right-0 z-20 min-w-[130px] bg-slate-50 px-3 py-3 text-right">کوهورت شروع</th>
              <th className="sticky right-[130px] z-20 min-w-[72px] bg-slate-50 px-3 py-3 text-center">مشتری</th>
              {Array.from({ length: totalPeriods }).map((_, i) => (
                <th key={i} className="min-w-[72px] px-2 py-3 text-center whitespace-nowrap">{label} {i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentCohorts.map(c => (
              <tr key={c.cohortKey} className="border-t border-slate-100">
                <td className="sticky right-0 z-10 bg-white px-3 py-3 text-right whitespace-nowrap">{periodLabel(c.cohortKey, period)}</td>
                <td className="sticky right-[130px] z-10 bg-white px-3 py-3 text-center font-semibold">{c.size.toLocaleString("fa-IR")}</td>
                {Array.from({ length: totalPeriods }).map((_, i) => {
                  const p = c.periods.find(x => x.index === i);
                  if (!p) return <td key={i} className="bg-slate-50/60 px-2 py-2 text-center text-slate-300">—</td>;
                  const pct = c.size ? Math.round(p.retained / c.size * 100) : 0;
                  return (
                    <td key={i} className="px-2 py-2 text-center" title={`${periodLabel(c.cohortKey, period)} · ${label} ${i} · ${p.retained} از ${c.size} مشتری`}>
                      <div className={`mx-auto min-w-[46px] rounded-md px-2 py-2 font-medium ${pct >= 50 ? "text-white" : "text-slate-800"}`} style={{ backgroundColor: pct >= 50 ? "rgb(29 78 216)" : pct > 0 ? `rgba(59,130,246,${Math.max(.12,pct/100)})` : "rgb(248 250 252)" }}>
                        {pct.toLocaleString("fa-IR")}٪
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span>۰٪ = بازگشتی ثبت نشده</span><span>— = خارج از بازه قابل مشاهده</span>
        <span>خانه‌های خالی یعنی آن دوره هنوز در داده‌های این کوهورت قرار نمی‌گیرد.</span>
      </div>
    </div>
  );
}
