import { toGregorian, isValidJalaaliDate } from "jalaali-js";

export type FieldKey = "customer" | "product" | "amount" | "date" | "orderId" | "quantity";

const PATTERNS: Record<FieldKey, RegExp[]> = {
  customer: [/مشتری/, /خریدار/, /customer/i, /buyer/i, /client/i],
  product:  [/محصول/, /کالا/, /product/i, /item/i, /sku/i],
  amount:   [/مبلغ/, /قیمت/, /amount/i, /total/i, /revenue/i, /price/i],
  date:     [/تاریخ/, /date/i, /زمان/, /created/i, /time/i],
  orderId:  [/سفارش/, /فاکتور/, /order/i, /invoice/i],
  quantity: [/تعداد/, /qty/i, /quantity/i]
};

export function detectColumns(headers: string[], sampleRows: any[] = []) {
  const used = new Set<string>();
  const result: Partial<Record<FieldKey, string>> = {};
  const priority: FieldKey[] = ["date", "amount", "customer", "product", "orderId", "quantity"];

  for (const field of priority) {
    const patterns = PATTERNS[field];
    const candidates = headers.filter(h => !used.has(h) && patterns.some(p => p.test(String(h))));
    if (candidates.length === 0) continue;

    let best = candidates[0];
    if (candidates.length > 1 && sampleRows.length > 0) {
      if (field === "amount") {
        best = candidates.find(h =>
          sampleRows.some(r => {
            const v = r[h];
            if (typeof v === "number") return true;
            if (typeof v === "string" && /^[\d۰-۹,،.\s]+$/.test(v)) return true;
            return false;
          })
        ) || candidates[0];
      }
      if (field === "date") {
        best = candidates.find(h =>
          sampleRows.some(r => {
            const v = String(r[h] ?? "");
            return /^\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2}/.test(v);
          })
        ) || candidates[0];
      }
    }

    result[field] = best;
    used.add(best);
  }

  return result;
}

export function parseAmount(v: any): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;

  let s = String(v).trim();
  if (!s) return null;

  s = s.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  s = s.replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  s = s.replace(/[,،\sتومانریال]/g, "");
  s = s.replace(/[^\d.\-]/g, "");

  if (!s || s === "-" || s === ".") return null;

  const n = Number(s);
  return isNaN(n) ? null : n;
}

export function parseDate(v: any): Date | null {
  if (v == null) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;

  if (typeof v === "number") {
    const s = String(v);
    if (/^\d{8}$/.test(s)) {
      const y = Number(s.slice(0, 4));
      const mo = Number(s.slice(4, 6));
      const d = Number(s.slice(6, 8));
      if (y >= 1200 && y <= 1500 && isValidJalaaliDate(y, mo, d)) {
        const g = toGregorian(y, mo, d);
        return new Date(Date.UTC(g.gy, g.gm - 1, g.gd));
      }
    }
    const epoch = Date.UTC(1899, 11, 30);
    return new Date(epoch + v * 86400000);
  }

  let s = String(v).trim();
  if (!s) return null;
  s = s.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  s = s.replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

  const m = s.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (m) {
    const [, yStr, moStr, dStr, hhStr, mmStr, ssStr] = m;
    const y = Number(yStr), mo = Number(moStr), d = Number(dStr);
    const hh = hhStr ? Number(hhStr) : 0, mi = mmStr ? Number(mmStr) : 0, se = ssStr ? Number(ssStr) : 0;

    if (y >= 1200 && y <= 1500) {
      if (!isValidJalaaliDate(y, mo, d)) return null;
      try {
        const g = toGregorian(y, mo, d);
        return new Date(Date.UTC(g.gy, g.gm - 1, g.gd, hh, mi, se));
      } catch {
        return null;
      }
    }
    if (y >= 1900 && y <= 2200) {
      if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
      return new Date(Date.UTC(y, mo - 1, d, hh, mi, se));
    }
  }

  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? null : fallback;
}