import ZarinPal from "zarinpal-node-sdk";

const merchantId = process.env.ZARINPAL_MERCHANT_ID;

export function isZarinpalConfigured() {
  return Boolean(merchantId);
}

export function getZarinpal() {
  if (!merchantId) {
    throw new Error("ZARINPAL_MERCHANT_ID is not configured");
  }

  return new ZarinPal({
    merchantId,
    sandbox: process.env.ZARINPAL_SANDBOX === "true",
  });
}

export function getPublicAppUrl(requestUrl?: string) {
  const configured = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (requestUrl) return new URL(requestUrl).origin;
  throw new Error("APP_URL or NEXT_PUBLIC_APP_URL is not configured");
}

export const PLAN_PRICES: Record<"pro" | "business", number> = {
  pro: 890000,
  business: 4900000,
};

export const PLAN_LABELS: Record<"pro" | "business", string> = {
  pro: "رشد",
  business: "حرفه‌ای",
};

export function planExpiryFromNow(currentExpiry?: Date | null) {
  const now = new Date();
  const base = currentExpiry && currentExpiry > now ? currentExpiry : now;
  return new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);
}
