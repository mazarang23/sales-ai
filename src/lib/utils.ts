import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { convertFromRial, currencyLabel, type Currency } from "@/lib/excel/currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// All analytics amounts are stored in rial. Display conversion is division.
export function formatMoney(n?: number | null, currency: Currency = "rial") {
  if (n == null) return "—";
  const value = convertFromRial(n, currency) ?? n;
  const decimals = currency === "rial" ? 0 : value < 10 ? 2 : value < 1000 ? 1 : 0;
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: decimals
  }).format(value) + " " + currencyLabel(currency);
}

// Backwards-compatible name used throughout the current UI: canonical rial display.
export function formatIRR(n?: number | null) {
  return formatMoney(n, "rial");
}

export function formatNum(n?: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("fa-IR").format(n);
}

export function formatDate(d?: string | Date | null) {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(dt);
}