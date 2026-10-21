import { Row } from "./kpi";
import { Period, periodKey } from "./periods";

export type CohortRow = {
  cohortKey: string;
  cohortLabel: string;
  size: number;
  periods: { index: number; retained: number; revenue: number }[];
};

export function computeCohort(
  rows: Row[],
  period: Period,
  filterProduct?: string
): CohortRow[] {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const filtered = filterProduct
    ? rows.filter(r => r && r.product === filterProduct)
    : rows.filter(r => r);

  // اعتبارسنجی و ساخت نقشه‌های بهینه
  // customer -> period -> total revenue
  const customerPeriodRevenue = new Map<string, Map<string, number>>();
  // customer -> اولین دوره‌ی خرید
  const firstPurchase = new Map<string, string>();

  for (const r of filtered) {
    if (!r || !r.customer || !r.date) continue;
    const d = new Date(r.date);
    if (isNaN(d.getTime())) continue;

    const key = periodKey(d, period);
    const cpMap = customerPeriodRevenue.get(r.customer) ?? new Map<string, number>();
    cpMap.set(key, (cpMap.get(key) ?? 0) + (r.amount ?? 0));
    customerPeriodRevenue.set(r.customer, cpMap);

    const existing = firstPurchase.get(r.customer);
    if (!existing || key < existing) {
      firstPurchase.set(r.customer, key);
    }
  }

  if (firstPurchase.size === 0) return [];

  // گروه‌بندی مشتریان بر اساس کوهورت
  const cohorts = new Map<string, string[]>();
  for (const [customer, cohortKey] of firstPurchase) {
    const arr = cohorts.get(cohortKey) ?? [];
    arr.push(customer);
    cohorts.set(cohortKey, arr);
  }

  const sortedCohorts = [...cohorts.entries()].sort(([a], [b]) => a.localeCompare(b));

  // همه‌ی دوره‌ها
  const allPeriodsSet = new Set<string>();
  for (const cpMap of customerPeriodRevenue.values()) {
    for (const k of cpMap.keys()) allPeriodsSet.add(k);
  }
  const allPeriods = [...allPeriodsSet].sort();

  return sortedCohorts.map(([cohortKey, customers]) => {
    const cohortIndex = allPeriods.indexOf(cohortKey);
    const cohortPeriods: { index: number; retained: number; revenue: number }[] = [];

    for (let i = 0; i < allPeriods.length - cohortIndex; i++) {
      const pKey = allPeriods[cohortIndex + i];
      let retained = 0;
      let revenue = 0;
      for (const c of customers) {
        const cpMap = customerPeriodRevenue.get(c);
        const amount = cpMap?.get(pKey);
        if (amount !== undefined) {
          retained++;
          revenue += amount;
        }
      }
      cohortPeriods.push({ index: i, retained, revenue });
    }

    return {
      cohortKey,
      cohortLabel: cohortKey,
      size: customers.length,
      periods: cohortPeriods
    };
  });
}