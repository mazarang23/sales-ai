import { ZarinPal } from "zarinpal-node-sdk";

export const zarinpal = new ZarinPal({
  merchantId: process.env.ZARINPAL_MERCHANT_ID || "",
  sandbox: process.env.ZARINPAL_SANDBOX === "true"
});

export const ZARINPAL_CALLBACK_BASE =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";