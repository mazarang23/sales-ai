import { Row } from "./kpi";

export type Segment = "Champions" | "Loyal" | "Potential" | "AtRisk" | "Lost";

export type RfmCustomer = {
  name: string;
  recency: number;      // روز از آخرین خرید (نسبت به امروز)
  count: number;        // تعداد خرید
  sum: number;          // مجموع خرید
  first: number;        // timestamp اولین خرید
  last: number;         // timestamp آخرین خرید
  hasDate: boolean;
  segment: Segment;
  segmentReason: string; // دلیل انتخاب سگمنت
};

export function computeRfm(rows: Row[]): RfmCustomer[] {
  // مرجع زمانی: امروز (نه آخرین تاریخ داده)
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

  // محاسبه‌ی اولیه‌ی recency برای همه
  const customers = [...byCustomer.entries()].map(([name, v]) => {
    const hasDate = v.last > 0;
    // recency: روز از آخرین خرید نسبت به امروز
    const recency = hasDate
      ? Math.max(0, Math.floor((now - v.last) / 86400000))
      : -1; // -1 یعنی تاریخ ندارد
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

  // محاسبه‌ی چندک‌ها (فقط برای مشتریان با تاریخ)
  const withDate = customers.filter(c => c.hasDate);
  const sortedR = [...withDate].sort((a, b) => a.recency - b.recency); // کمترین recency = بهترین
  const sortedF = [...withDate].sort((a, b) => b.count - a.count); // بیشترین count = بهترین
  const sortedM = [...customers].sort((a, b) => b.sum - a.sum); // بیشترین sum = بهترین

  function quintile<T>(sorted: T[], item: T): number {
    const idx = sorted.indexOf(item);
    if (idx < 0) return 1;
    const q = sorted.length / 5;
    return Math.min(5, Math.floor(idx / q) + 1);
  }

  return customers.map(c => {
    if (!c.hasDate) {
      // مشتری بدون تاریخ خرید
      return {
        ...c,
        segment: "Potential" as Segment,
        segmentReason: "تاریخ خرید ثبت نشده؛ در بخش «بالقوه» قرار گرفت."
      };
    }

    const rScore = quintile(sortedR, c); // ۵ = نزدیک‌ترین (بهترین)
    const fScore = quintile(sortedF, c); // ۵ = بیشترین تعداد (بهترین)
    const mScore = quintile(sortedM, c); // ۵ = بیشترین مبلغ (بهترین)
    const avg = (rScore + fScore + mScore) / 3;

    let segment: Segment;
    let reason: string;

    if (avg >= 4.5) {
      segment = "Champions";
      reason = `میانگین ${avg.toFixed(1)}: خرید اخیر (${c.recency} روز پیش)، ${c.count} خرید، مبلغ ${Math.round(c.sum).toLocaleString("fa-IR")}`;
    } else if (avg >= 3.5) {
      segment = "Loyal";
      reason = `میانگین ${avg.toFixed(1)}: خرید اخیر (${c.recency} روز پیش)، ${c.count} خرید`;
    } else if (avg >= 2.5) {
      segment = "Potential";
      reason = `میانگین ${avg.toFixed(1)}: پتانسیل رشد (${c.recency} روز پیش، ${c.count} خرید)`;
    } else if (avg >= 1.5) {
      segment = "AtRisk";
      reason = `میانگین ${avg.toFixed(1)}: در خطر ریزش (${c.recency} روز پیش، ${c.count} خرید)`;
    } else {
      segment = "Lost";
      reason = `میانگین ${avg.toFixed(1)}: از دست رفته (${c.recency} روز پیش، ${c.count} خرید)`;
    }

    return { ...c, segment, segmentReason: reason };
  });
}