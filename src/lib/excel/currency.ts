export type Currency = "rial" | "toman" | "thousand_toman" | "million_toman";

// Canonical storage/analytics unit: rial.
export const CURRENCIES: { value: Currency; label: string; toRialFactor: number }[] = [
  { value: "rial", label: "ریال", toRialFactor: 1 },
  { value: "toman", label: "تومان", toRialFactor: 10 },
  { value: "thousand_toman", label: "هزار تومان", toRialFactor: 10_000 },
  { value: "million_toman", label: "میلیون تومان", toRialFactor: 10_000_000 }
];

// Normalize a value from the unit used by the uploaded file into rial.
export function applyCurrency(amount: number | null, currency: Currency): number | null {
  if (amount == null) return null;
  const found = CURRENCIES.find(c => c.value === currency);
  return amount * (found?.toRialFactor ?? 1);
}

// Convert a canonical rial amount for display. Display conversion is division.
export function convertFromRial(amount: number | null, currency: Currency): number | null {
  if (amount == null) return null;
  const found = CURRENCIES.find(c => c.value === currency);
  return amount / (found?.toRialFactor ?? 1);
}

export function currencyLabel(currency: string): string {
  return CURRENCIES.find(c => c.value === currency)?.label || "ریال";
}