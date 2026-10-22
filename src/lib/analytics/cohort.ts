import { Row } from "./kpi";
import { Period, periodKey } from "./periods";

export type CohortRow = {
  cohortKey: string;
  cohortLabel: string;
  size: number;
  periods: { index: number; retained: number; revenue: number }[];
};

function addPeriod(key: string, period: Period, amount: number): string {
  const d = new Date(key + "T00:00:00Z");
  if (period === "day") d.setUTCDate(d.getUTCDate() + amount);
  else if (period === "week") d.setUTCDate(d.getUTCDate() + 7 * amount);
  else d.setUTCMonth(d.getUTCMonth() + amount);
  return periodKey(d, period);
}

export function computeCohort(rows: Row[], period: Period, filterProduct?: string): CohortRow[] {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const filtered = rows.filter(r => r && r.customer && r.date && (!filterProduct || r.product === filterProduct));
  const customerPeriodRevenue = new Map<string, Map<string, number>>();
  const firstPurchase = new Map<string, string>();

  for (const r of filtered) {
    const d = new Date(r.date as string | Date);
    if (!Number.isFinite(d.getTime())) continue;
    const customer = (r.customer as string).trim();
    if (!customer) continue;
    const key = periodKey(d, period);
    const cp = customerPeriodRevenue.get(customer) ?? new Map<string, number>();
    const amount = typeof r.amount === "number" && Number.isFinite(r.amount) ? r.amount : 0;
    cp.set(key, (cp.get(key) ?? 0) + amount);
    customerPeriodRevenue.set(customer, cp);
    const first = firstPurchase.get(customer);
    if (!first || key < first) firstPurchase.set(customer, key);
  }
  if (!firstPurchase.size) return [];

  const cohorts = new Map<string, string[]>();
  for (const [customer, key] of firstPurchase) {
    const members = cohorts.get(key) ?? [];
    members.push(customer);
    cohorts.set(key, members);
  }

  // Fill missing calendar periods so an empty month/week never shifts retention indices.
  const observed = [...new Set([...customerPeriodRevenue.values()].flatMap(m => [...m.keys()]))].sort();
  const allPeriods: string[] = [];
  if (observed.length) {
    let cursor = observed[0];
    const end = observed[observed.length - 1];
    for (let guard = 0; cursor <= end && guard < 5000; guard++) {
      allPeriods.push(cursor);
      const next = addPeriod(cursor, period, 1);
      if (next <= cursor) break;
      cursor = next;
    }
  }

  return [...cohorts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([cohortKey, members]) => {
    const start = allPeriods.indexOf(cohortKey);
    const periods: { index: number; retained: number; revenue: number }[] = [];
    for (let i = 0; start >= 0 && start + i < allPeriods.length; i++) {
      const key = allPeriods[start + i];
      let retained = 0;
      let revenue = 0;
      for (const customer of members) {
        const amount = customerPeriodRevenue.get(customer)?.get(key);
        if (amount !== undefined) {
          retained++;
          revenue += amount;
        }
      }
      periods.push({ index: i, retained, revenue });
    }
    return { cohortKey, cohortLabel: cohortKey, size: members.length, periods };
  });
}
