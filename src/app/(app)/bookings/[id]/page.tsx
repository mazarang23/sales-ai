import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ChatBox } from "@/components/app/ChatBox";
import { ReviewForm } from "@/components/app/ReviewForm";
import { BackButton } from "@/components/app/BackButton";
import { AppNav } from "@/components/app/AppNav";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      consultant: { select: { displayName: true, photoUrl: true } },
      review: true
    }
  });
  if (!booking || booking.userId !== user.id) notFound();

  const statusMap: Record<string, string> = {
    pending: "در انتظار تایید مشاور",
    accepted: "تایید شده",
    rejected: "رد شده",
    completed: "تکمیل شده"
  };

  const payMap: Record<string, string> = {
    unpaid: "پرداخت نشده",
    pending_review: "در انتظار تایید پرداخت",
    paid: "پرداخت شده"
  };

  const canChat = booking.status === "accepted" || booking.status === "completed";
  const canPay = booking.status === "accepted" && booking.paymentStatus !== "paid";
  const canReview = booking.status === "completed" && !booking.review;

  return (
    <>
      <AppNav current="bookings" />
      <div className="container-tight py-10 max-w-2xl space-y-6" dir="rtl">
        <BackButton href="/bookings" label="بازگشت به جلسات" />

        {sp.payment === "success" && (
          <div className="rounded-xl bg-emerald-50 text-emerald-800 p-3 text-sm">
            ✅ پرداخت با موفقیت انجام شد.
          </div>
        )}
        {sp.payment === "failed" && (
          <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">
            پرداخت ناموفق بود یا لغو شد.
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {booking.consultant.photoUrl ? (
              <img
                src={booking.consultant.photoUrl}
                alt={booking.consultant.displayName}
                className="h-12 w-12 rounded-xl object-cover border border-slate-200"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-700 grid place-items-center font-black">
                {booking.consultant.displayName.slice(0, 1)}
              </div>
            )}
            <div>
              <div className="font-bold">{booking.consultant.displayName}</div>
              <div className="text-xs text-slate-500">
                {formatDate(booking.createdAt)} — {booking.amount.toLocaleString("fa-IR")} تومان
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4 text-sm flex items-center justify-between flex-wrap gap-2">
          <div>
            وضعیت جلسه:{" "}
            <span className="font-medium">{statusMap[booking.status] || booking.status}</span>
          </div>
          <div>
            وضعیت پرداخت:{" "}
            <span
              className={`font-medium ${
                booking.paymentStatus === "paid" ? "text-emerald-700" : "text-slate-600"
              }`}
            >
              {payMap[booking.paymentStatus]}
            </span>
          </div>
        </div>

        {canPay && (
          <Link
            href={`/bookings/${booking.id}/pay`}
            className="btn-primary w-full text-center py-3"
          >
            پرداخت آنلاین جلسه
          </Link>
        )}

        {canChat && (
          <ChatBox
            bookingId={booking.id}
            mySenderId={user.id}
            role="user"
            disabled={booking.paymentStatus !== "paid"}
          />
        )}

        {canChat && booking.paymentStatus !== "paid" && (
          <div className="rounded-xl bg-amber-50 text-amber-800 p-3 text-sm">
            چت بعد از تایید پرداخت فعال می‌شود.
          </div>
        )}

        {!canChat && booking.status === "pending" && (
          <div className="card p-4 muted text-sm">در انتظار تایید مشاور.</div>
        )}

        {canReview && <ReviewForm bookingId={booking.id} />}

        {booking.review && (
          <div className="card p-4 text-sm">
            <div className="font-bold mb-1">امتیاز شما</div>
            <div className="text-emerald-700">⭐ {booking.review.rating}/5</div>
            {booking.review.comment && (
              <p className="mt-2 leading-6">{booking.review.comment}</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}