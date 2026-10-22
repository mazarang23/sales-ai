const MARKET_URL = "https://raw.githubusercontent.com/iran-market/iran-market.github.io/main/data/popular.json";
const FALLBACK_RATE = Number(process.env.AI_USD_TO_TOMAN || 0);
const CACHE_MS = 30 * 60 * 1000;

let cache: { rate: number; fetchedAt: number; source: string } | null = null;

export type UsdTomanRate = {
  rate: number;
  fetchedAt: Date;
  source: string;
};

/**
 * Returns the latest available USD/free-market price in Toman.
 * The public Iran Market Data feed updates roughly every 30 minutes.
 * We cache it server-side to avoid unnecessary external calls.
 */
export async function getUsdToTomanRate(): Promise<UsdTomanRate> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) {
    return { ...cache, fetchedAt: new Date(cache.fetchedAt) };
  }

  try {
    const response = await fetch(MARKET_URL, {
      next: { revalidate: 1800 },
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(`market-rate-${response.status}`);

    const payload = await response.json();
    const usd = payload?.data?.find?.((item: { symbol?: string }) => item.symbol === "USD_IRR_FREE");
    const rate = Number(usd?.price);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error("invalid-market-rate");

    cache = { rate, fetchedAt: Date.now(), source: "iran-market" };
    return { rate, fetchedAt: new Date(), source: "iran-market" };
  } catch {
    if (FALLBACK_RATE > 0) {
      return { rate: FALLBACK_RATE, fetchedAt: new Date(), source: "environment-fallback" };
    }
    throw new Error("USD_TOMAN_RATE_UNAVAILABLE");
  }
}

export async function usdToToman(usd: number): Promise<number> {
  const { rate } = await getUsdToTomanRate();
  return Math.round(usd * rate);
}
