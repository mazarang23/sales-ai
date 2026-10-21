import { Row } from "./kpi";

export type Segment = "Champions" | "Loyal" | "Potential" | "AtRisk" | "Lost";

export type RfmCustomer = {
  name: string;
  recency: number;
  count: number;
  sum: number;
  first: number;
  last: number;
  hasDate: boolean;
  segment: Segment;
  segmentReason: string;
  rScore: number;
  fScore: number;
  mScore: number;
};

export function computeRfm(rows: Row[]): RfmCustomer[] {
  const now = Date.now();

  const byCustomer = new Map<
    string,
    { last: number; first: number; count: number; sum: number }
  >();

  for (const r of rows) {
    if (!r.customer) continue;
    const rawT = r.date ? new Date(r.date).getTime() : 0;
    const validT = !isNaN(rawT) && rawT > 0 ? rawT : 0;

    const c = byCustomer.get(r.customer) ?? {
      last: 0,
      first: 0,
      count: 0,
      sum: 0
    };
    c.count += 1;
    c.sum += r.amount ?? 0;
    if (validT > 0) {
      if (validT > c.last) c.last = validT;
      if (c.first === 0 || validT < c.first) c.first = validT;
    }
    byCustomer.set(r.customer, c);
  }

  const customers = [...byCustomer.entries()].map(([name, v]) => {
    const hasDate = v.last > 0;
    const recency = hasDate
      ? Math.max(0, Math.floor((now - v.last) / 86400000))
      : -1;
    return {
      name,
      recency,
      count: v.count,
      sum: v.sum,
      first: v.first,
      last: v.last,
      hasDate
    };
  });

  const withDate = customers.filter(c => c.hasDate);
  const sortedR = [...withDate].sort((a, b) => a.recency - b.recency);
  const sortedF = [...withDate].sort((a, b) => b.count - a.count);
  const sortedM = [...customers].sort((a, b) => b.sum - a.sum);

  function quintile<T>(sorted: T[], item: T): number {
    if (sorted.length === 0) return 1;
    const idx = sorted.indexOf(item);
    if (idx < 0) return 1;
    const q = sorted.length / 5;
    return Math.min(5, Math.floor(idx / q) + 1);
  }

  return customers.map(c => {
    if (!c.hasDate) {
      return {
        ...c,
        segment: "Potential" as Segment,
        segmentReason:
          "تاریخ خرید ثبت نشده است؛ در بخش «بالقوه» قرار گرفت.",
        rScore: 0,
        fScore: 0,
        mScore: 0
      };
    }

    const rScore = quintile(sortedR, c);
    const fScore = quintile(sortedF, c);
    const mScore = quintile(sortedM, c);
    const avg = (rScore + fScore + mScore) / 3;

    let segment: Segment;
    let reason: string;

    if (avg >= 4.5) {
      segment = "Champions";
      reason = `میانگین ${avg.toFixed(1)} — خرید اخیر (${c.recency} روز پیش)، ${c.count} خرید، مجموع ${Math.round(c.sum).toLocaleString("fa-IR")} تومان`;
    } else if (avg >= 3.5) {
      segment = "Loyal";
      reason = `میانگین ${avg.toFixed(1)} — خرید نسبتاً اخیر (${c.recency} روز پیش)، ${c.count} خرید`;
    } else if (avg >= 2.5) {
      segment = "Potential";
      reason = `میانگین ${avg.toFixed(1)} — پتانسیل رشد (${c.recency} روز پیش، ${c.count} خرید)`;
    } else if (avg >= 1.5) {
      segment = "AtRisk";
      reason = `میانگین ${avg.toFixed(1)} — در خطر ریزش (${c.recency} روز پیش، ${c.count} خرید)`;
    } else {
      segment = "Lost";
      reason = `میانگین ${avg.toFixed(1)} — از دست رفته (${c.recency} روز پیش، ${c.count} خرید)`;
    }

    return { ...c, segment, segmentReason: reason, rScore, fScore, mScore };
  });
}