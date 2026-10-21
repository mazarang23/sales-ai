import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getPaymentInfo } from "@/lib/payment-info";
import { PaymentInstructions } from "@/components/app/PaymentInstructions";
import { BackButton } from "@/components/app/BackButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PayPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking || booking.userId !== user.id) notFound();

  if (booking.status !== "accepted") {
    return (
      <div className="container-tight py-10 max-w-md" dir="rtl">
        <BackButton href={`/bookings/${id}`} label="بازگشت به جلسه" />
        <h1 className="h2 mt-4">پرداخت</h1>
        <p className="muted mt-3 text-sm">پرداخت فقط بعد از تایید مشاور ممکن است.</p>
      </div>
    );
  }

  if (booking.paymentStatus !== "unpaid") {
    return (
      <div className="container-tight py-10 max-w-md" dir="rtl">
        <BackButton href={`/bookings/${id}`} label="بازگشت به جلسه" />
        <h1 className="h2 mt-4">پرداخت</h1>
        <p className="muted mt-3 text-sm">
          وضعیت پرداخت:{" "}
          {booking.paymentStatus === "pending_review"
            ? "در انتظار تایید ادمین"
            : "پرداخت شده"}
        </p>
      </div>
    );
  }

  const info = await getPaymentInfo();

  return (
    <div className="container-tight py-10 max-w-md" dir="rtl">
      <BackButton href={`/bookings/${id}`} label="بازگشت به جلسه" />
      <h1 className="h2 mt-4 mb-4">پرداخت جلسه</h1>
      <PaymentInstructions bookingId={booking.id} amount={booking.amount} info={info} />
      <p className="mt-4 text-center text-sm text-slate-500">
        <Link href="/bookings" className="text-brand-600">
          مشاهده همه جلسات
        </Link>
      </p>
    </div>
  );
}