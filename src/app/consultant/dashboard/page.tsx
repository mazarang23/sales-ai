import { getCurrentConsultant } from "@/lib/consultant-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ConsultantPhotoSection } from "@/components/consultant/ConsultantPhotoSection";
import { BookingActions } from "@/components/consultant/BookingActions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ConsultantDashboard() {
  const consultant = await getCurrentConsultant();
  if (!consultant) redirect("/consultant/login");

  const bookings = await db.booking.findMany({
    where: { consultantId: consultant.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { phone: true, name: true } } }
  });

  const statusMap: Record<string, string> = {
    pending: "در انتظار تایید ادمین",
    approved: "تایید شده",
    rejected: "رد شده"
  };

  const bookingStatusMap: Record<string, string> = {
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

  const paidBookings = bookings.filter(
    b => b.paymentStatus === "paid" && b.status === "completed"
  );
  const income = paidBookings.reduce((s, b) => s + b.amount * 0.8, 0);

  return (
    <div className="container-tight py-10 space-y-6" dir="rtl">
      <div>
        <h1 className="h2">پنل مشاور</h1>
        <p className="muted mt-1 text-sm">
          وضعیت پروفایل:{" "}
          <span
            className={`font-medium ${
              consultant.status === "approved"
                ? "text-emerald-700"
                : consultant.status === "rejected"
                ? "text-red-700"
                : "text-amber-700"
            }`}
          >
            {statusMap[consultant.status]}
          </span>
        </p>
      </div>

      <div className="card p-6">
        <div className="font-bold mb-3">عکس پروفایل</div>
        <ConsultantPhotoSection current={consultant.photoUrl} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs text-slate-500">تعرفه ساعتی</div>
          <div className="mt-1 text-xl font-bold">
            {consultant.hourlyRate.toLocaleString("fa-IR")} تومان
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500">جلسات تکمیل‌شده</div>
          <div className="mt-1 text-xl font-bold">{paidBookings.length}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500">درآمد تاییدشده (۸۰٪)</div>
          <div className="mt-1 text-xl font-bold">
            {income.toLocaleString("fa-IR")} تومان
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="font-bold mb-3">درخواست‌های جلسه</div>
        {bookings.length === 0 ? (
          <div className="muted text-sm">هنوز درخواستی نداری.</div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="flex justify-between items-start gap-3 flex-wrap">
                  <div>
                    <span className="font-medium" dir="ltr">
                      {b.user ? b.user.phone : "—"}
                    </span>
                    {b.user?.name && (
                      <span className="mr-2 text-slate-600">({b.user.name})</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    {formatDate(b.createdAt)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {b.hours} ساعت — مبلغ: {b.amount.toLocaleString("fa-IR")} تومان — وضعیت:{" "}
                  {bookingStatusMap[b.status] || b.status} — {payMap[b.paymentStatus]}
                </div>
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <BookingActions bookingId={b.id} status={b.status} />
                  <Link
                    href={`/consultant/bookings/${b.id}`}
                    className="text-xs text-brand-600"
                  >
                    چت و جزئیات
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center">
        <Link href="/" className="text-sm text-slate-500">
          بازگشت به سایت
        </Link>
      </div>
    </div>
  );
}