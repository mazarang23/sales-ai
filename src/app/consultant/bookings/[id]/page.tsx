import { getCurrentConsultant } from "@/lib/consultant-auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ChatBox } from "@/components/app/ChatBox";
import { BookingActions } from "@/components/consultant/BookingActions";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ConsultantBookingPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const consultant = await getCurrentConsultant();
  if (!consultant) redirect("/consultant/login");

  const booking = await db.booking.findUnique({
    where: { id },
    include: { user: { select: { phone: true, name: true } } }
  });
  if (!booking || booking.consultantId !== consultant.id) notFound();

  const statusMap: Record<string, string> = {
    pending: "در انتظار تایید شما",
    accepted: "تایید شده",
    rejected: "رد شده",
    completed: "تکمیل شده"
  };

  const payMap: Record<string, string> = {
    unpaid: "پرداخت نشده",
    pending_review: "در انتظار تایید پرداخت",
    paid: "پرداخت شده"
  };

  const canChat = booking.paymentStatus === "paid";

  return (
    <div className="container-tight py-10 max-w-2xl space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-bold">{booking.user ? booking.user.phone : "—"}</div>
          <div className="text-xs text-slate-500">
            {booking.user?.name || "—"} — {formatDate(booking.createdAt)} —{" "}
            {booking.amount.toLocaleString("fa-IR")} تومان
          </div>
        </div>
        <Link href="/consultant/dashboard" className="btn-ghost text-sm">
          بازگشت
        </Link>
      </div>

      <div className="card p-4 flex items-center justify-between flex-wrap gap-2 text-sm">
        <div>
          وضعیت: <span className="font-medium">{statusMap[booking.status]}</span>
        </div>
        <div>
          پرداخت: <span className="font-medium">{payMap[booking.paymentStatus]}</span>
        </div>
        <BookingActions bookingId={booking.id} status={booking.status} />
      </div>

      {canChat ? (
        <ChatBox
          bookingId={booking.id}
          mySenderId={consultant.id}
          role="consultant"
        />
      ) : (
        <div className="rounded-xl bg-amber-50 text-amber-800 p-3 text-sm">
          چت بعد از تایید پرداخت توسط ادمین فعال می‌شود.
        </div>
      )}
    </div>
  );
}