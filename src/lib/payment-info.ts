import { db } from "@/lib/db";

const DEFAULTS = {
  cardNumber: "6219-8619-1234-5678",
  shaba: "IR00-0000-0000-0000-0000-0000-00",
  holderName: "فروشیار",
  bankName: "بانک سامان"
};

export async function getPaymentInfo() {
  try {
    const items = await db.siteContent.findMany({
      where: {
        key: {
          in: [
            "payment.cardNumber",
            "payment.shaba",
            "payment.holderName",
            "payment.bankName"
          ]
        }
      }
    });
    const map: Record<string, string> = {};
    for (const i of items) map[i.key] = i.value;
    return {
      cardNumber: map["payment.cardNumber"] || DEFAULTS.cardNumber,
      shaba: map["payment.shaba"] || DEFAULTS.shaba,
      holderName: map["payment.holderName"] || DEFAULTS.holderName,
      bankName: map["payment.bankName"] || DEFAULTS.bankName
    };
  } catch {
    return DEFAULTS;
  }
}