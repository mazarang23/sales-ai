export type Currency = "toman" | "rial" | "thousand_toman" | "million_toman";

export const CURRENCIES: { value: Currency; label: string; factor: number }[] = [
  { value: "toman", label: "تومان", factor: 1 },
  { value: "rial", label: "ریال (÷۱۰)", factor: 0.1 },
  { value: "thousand_toman", label: "هزار تومان (×۱۰۰۰)", factor: 1000 },
  { value: "million_toman", label: "میلیون تومان (×۱,۰۰۰,۰۰۰)", factor: 1_000_000 }
];

export function applyCurrency(amount: number | null, currency: Currency): number | null {
  if (amount == null) return null;
  const found = CURRENCIES.find(c => c.value === currency);
  if (!found) return amount;
  return amount * found.factor;
}

export function currencyLabel(currency: string): string {
  return CURRENCIES.find(c => c.value === currency)?.label || "تومان";
}