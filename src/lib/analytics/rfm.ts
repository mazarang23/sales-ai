import { Row } from "./kpi";

export type Segment = "Champions" | "Loyal" | "Potential" | "AtRisk" | "Lost";
export type RfmCustomer = {
  name: string; recency: number; count: number; sum: number; first: number; last: number;
  hasDate: boolean; segment: Segment; segmentReason: string; rScore: number; fScore: number; mScore: number;
};

/**
 * Recency is measured against the latest valid date in this uploaded dataset, making
 * historical analyses reproducible. Frequency counts distinct order IDs when present;
 * rows without an order ID are treated as individual transactions.
 */
export function computeRfm(rows: Row[]): RfmCustomer[] {
  const validRows = (Array.isArray(rows) ? rows : []).filter(r =>
    r && typeof r.customer === "string" && r.customer.trim().length > 0
  ).map(r => {
    const timestamp = r.date ? new Date(r.date).getTime() : 0;
    return {
      ...r,
      customer: (r.customer as string).trim(),
      timestamp: Number.isFinite(timestamp) && timestamp > 0 ? timestamp : 0,
      amount: typeof r.amount === "number" && Number.isFinite(r.amount) ? r.amount : 0
    };
  });
  const analysisDate = validRows.reduce((max, r) => Math.max(max, r.timestamp), 0);
  const byCustomer = new Map<string, {
    first: number; last: number; sum: number; orderIds: Set<string>; rowsWithoutOrderId: number;
  }>();

  for (const row of validRows) {
    const value = byCustomer.get(row.customer!) ?? {
      first: 0, last: 0, sum: 0, orderIds: new Set<string>(), rowsWithoutOrderId: 0
    };
    value.sum += row.amount ?? 0;
    if (row.orderId?.trim()) value.orderIds.add(row.orderId.trim());
    else value.rowsWithoutOrderId += 1;
    if (row.timestamp) {
      value.first = value.first ? Math.min(value.first, row.timestamp) : row.timestamp;
      value.last = Math.max(value.last, row.timestamp);
    }
    byCustomer.set(row.customer!, value);
  }

  const customers = [...byCustomer.entries()].map(([name, v]) => ({
    name,
    recency: v.last && analysisDate ? Math.max(0, Math.floor((analysisDate - v.last) / 86400000)) : -1,
    count: v.orderIds.size + v.rowsWithoutOrderId,
    sum: v.sum, first: v.first, last: v.last, hasDate: v.last > 0
  }));
  const dated = customers.filter(c => c.hasDate);

  // Tied metric values get the same score instead of arbitrary scores from sort order.
  function score(value: number, values: number[], lowerIsBetter = false): number {
    if (!values.length) return 1;
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max) return 3;
    const less = values.filter(v => v < value).length;
    const equal = values.filter(v => v === value).length;
    const percentile = (less + equal / 2) / values.length;
    const ascending = Math.max(1, Math.min(5, Math.ceil(percentile * 5)));
    return lowerIsBetter ? 6 - ascending : ascending;
  }

  const recencies = dated.map(c => c.recency);
  const frequencies = dated.map(c => c.count);
  const monetary = dated.map(c => c.sum);

  return customers.map(c => {
    if (!c.hasDate) return {
      ...c, segment: "Potential" as Segment,
      segmentReason: "تاریخ خرید معتبر ثبت نشده؛ امتیاز RFM برای این مشتری قابل اتکا نیست.",
      rScore: 0, fScore: 0, mScore: 0
    };

    const rScore = score(c.recency, recencies, true);
    const fScore = score(c.count, frequencies);
    const mScore = score(c.sum, monetary);
    let segment: Segment;
    let reason: string;

    if (rScore >= 4 && fScore >= 4 && mScore >= 4) {
      segment = "Champions"; reason = "خرید اخیر، تکرار خرید بالا و ارزش خرید بالا";
    } else if (rScore >= 3 && fScore >= 3) {
      segment = "Loyal"; reason = "خرید نسبتاً اخیر و تکرار خرید مناسب";
    } else if (rScore >= 3 && fScore <= 2) {
      segment = "Potential"; reason = "خرید اخیر، اما هنوز خریدهای تکراری کمی دارد";
    } else if (rScore <= 2 && (fScore >= 3 || mScore >= 3)) {
      segment = "AtRisk"; reason = "در گذشته ارزش یا تکرار خرید مناسبی داشته، اما مدتی است خرید نکرده";
    } else {
      segment = "Lost"; reason = "تازگی، تکرار و ارزش خرید پایین‌تر از سایر مشتریان";
    }
    return {
      ...c, segment,
      segmentReason: `${reason}؛ آخرین خرید ${c.recency} روز قبل از آخرین تاریخ فایل، ${c.count} تراکنش، مجموع ${Math.round(c.sum).toLocaleString("fa-IR")}`,
      rScore, fScore, mScore
    };
  });
}
