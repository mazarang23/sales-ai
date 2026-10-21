import { CohortRow } from "@/lib/analytics/cohort";
import { Period, periodLabel } from "@/lib/analytics/periods";

const MAX_COLUMNS = 12;

export function CohortTable({
  cohorts,
  period
}: {
  cohorts: CohortRow[];
  period: Period;
}) {
  if (!Array.isArray(cohorts) || cohorts.length === 0) {
    return (
      <div className="muted text-sm py-4">
        داده‌ای برای تحلیل کوهورت موجود نیست.
      </div>
    );
  }

  const totalPeriods = Math.max(...cohorts.map(c => c.periods?.length || 0));
  const showColumns = Math.min(totalPeriods, MAX_COLUMNS);
  const truncated = totalPeriods > MAX_COLUMNS;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-2 py-2 text-right sticky right-0 bg-slate-50 z-10">کوهورت</th>
              <th className="px-2 py-2 text-right">تعداد</th>
              {Array.from({ length: showColumns }).map((_, i) => (
                <th key={i} className="px-2 py-2 text-center">
                  {period === "day" ? `روز ${i}` : period === "week" ? `هفته ${i}` : `ماه ${i}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map(c => (
              <tr key={c.cohortKey} className="border-t border-slate-100">
                <td className="px-2 py-2 text-right sticky right-0 bg-white whitespace-nowrap z-10">
                  {periodLabel(c.cohortKey, period)}
                </td>
                <td className="px-2 py-2 text-right font-medium">{c.size}</td>
                {Array.from({ length: showColumns }).map((_, i) => {
                  const p = (c.periods || []).find(x => x.index === i);
                  if (!p) return <td key={i} className="px-2 py-2"></td>;
                  const pct = c.size > 0 ? Math.round((p.retained / c.size) * 100) : 0;
                  const opacity = pct > 0 ? Math.min(1, pct / 100 + 0.15) : 0;
                  return (
                    <td key={i} className="px-2 py-2 text-center">
                      <div
                        className="rounded px-1.5 py-1 inline-block min-w-[42px]"
                        style={{
                          backgroundColor: `rgba(37, 99, 235, ${opacity})`,
                          color: pct > 50 ? "white" : "#1e293b"
                        }}
                      >
                        {pct}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {truncated && (
        <div className="rounded-xl bg-amber-50 text-amber-800 p-3 text-xs">
          نمایش {MAX_COLUMNS} ستون اول از {totalPeriods} دوره. برای مشاهده دقیق‌تر، بازه را بزرگ‌تر کنید (هفتگی یا ماهانه).
        </div>
      )}
    </div>
  );
}