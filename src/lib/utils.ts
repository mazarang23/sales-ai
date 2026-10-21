import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIRR(n?: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("fa-IR").format(Math.round(n)) + " تومان";
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