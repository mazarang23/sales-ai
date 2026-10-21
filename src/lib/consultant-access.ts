import { db } from "@/lib/db";
import { getCurrentConsultant } from "@/lib/consultant-auth";

const SENSITIVE_PATTERNS = [
  /customer/i,
  /phone/i,
  /mobile/i,
  /tel/i,
  /email/i,
  /address/i,
  /مشتری/,
  /تلفن/,
  /موبایل/,
  /ایمیل/,
  /آدرس/,
  /شماره.*تماس/
];

export function isSensitiveColumn(name: string): boolean {
  return SENSITIVE_PATTERNS.some(p => p.test(name));
}

export async function getBookingForConsultant(bookingId: string) {
  const consultant = await getCurrentConsultant();
  if (!consultant) return null;

  const booking = await db.booking.findFirst({
    where: { id: bookingId, consultantId: consultant.id },
    include: {
      user: { select: { id: true, phone: true, name: true } }
    }
  });
  if (!booking) return null;

  // دسترسی فقط بعد از پرداخت
  if (booking.paymentStatus !== "paid") return null;
  if (booking.status !== "accepted" && booking.status !== "completed") return null;

  return { booking, consultant };
}