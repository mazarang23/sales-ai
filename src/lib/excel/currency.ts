export type Currency = "rial" | "toman" | "thousand_toman" | "million_toman";

// Amounts are normalized to rial before analytics are calculated.
// 1 toman = 10 rial, so converting a file stored in toman to the
// canonical rial unit requires multiplication. Display conversion is
// the inverse (division), handled by formatMoney below.
export const CURRENCIES: { value: Currency; label: string; toRialFactor: number }[] = [
  { value: "rial", label: "ریال", toRialFactor: 1 },
  { value: "toman", label: "تومان", toRialFactor: 10 },
  { value: "thousand_toman", label: "هزار تومان", toRialFactor: 10_000 },
  { value: "million_toman", label: "میلیون تومان", toRialFactor: 10_000_000 }
];

export function applyCurrency(amount: number | null, currency: Currency): number | null {
  if (amount == null) return null;
  const found = CURRENCIES.find(c => c.value === currency);
  return amount * (found?.toRialFactor ?? 1);
}

export function convertFromRial(amount: number | null, currency: Currency): number | null {
  if (amount == null) return null;
  const found = CURRENCIES.find(c => c.value === currency);
  return amount / (found?.toRialFactor ?? 1);
}

export function currencyLabel(currency: string): string {
  return CURRENCIES.find(c => c.value === currency)?.label || "ریال";
}