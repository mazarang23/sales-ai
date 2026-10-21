export type Row = {
  customer?: string | null;
  product?: string | null;
  amount?: number | null;
  date?: Date | string | null;
  orderId?: string | null;
};

export function computeKpis(rows: Row[]) {
  const total = rows.reduce((s, r) => s + (r.amount ?? 0), 0);
  const orders = new Set(rows.map(r => r.orderId).filter(Boolean)).size || rows.length;
  const customers = new Set(rows.map(r => r.customer).filter(Boolean)).size;
  const aov = orders ? total / orders : 0;
  return { total, orders, customers, aov };
}

export function salesByDay(rows: Row[]) {
  const map = new Map<string, number>();
  for (const r of rows) {
    if (!r.date) continue;
    const d = new Date(r.date).toISOString().slice(0, 10);
    map.set(d, (map.get(d) ?? 0) + (r.amount ?? 0));
  }
  return [...map.entries()].sort().map(([date, amount]) => ({ date, amount }));
}

export function topBy(rows: Row[], key: "product" | "customer", limit = 10) {
  const map = new Map<string, { amount: number; count: number }>();
  for (const r of rows) {
    const k = r[key];
    if (!k) continue;
    const c = map.get(k) ?? { amount: 0, count: 0 };
    c.amount += r.amount ?? 0;
    c.count += 1;
    map.set(k, c);
  }
  return [...map.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}