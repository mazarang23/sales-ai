import { db } from "@/lib/db";
import { formatIRR, formatDate } from "@/lib/utils";
import { ConfirmPayment } from "@/components/admin/ConfirmPayment";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter = sp.status || "";

  const where = statusFilter ? { paymentStatus: statusFilter } : {};

  const bookings = await db.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { phone: true } },
      consultant: { select: { displayName: true } }
    }
  });

  const totalRevenue = bookings
    .filter(b => b.paymentStatus === "paid")
    .reduce((s, b) => s + b.amount, 0);

  const statusMap: Record<string, string> = {
    unpaid: "پرداخت نشده",
    pending_review: "در انتظار تایید",
    paid: "پرداخت شده"
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="h2">تراکنش‌های جلسات</h1>
        <p className="muted mt-1 text-sm">مدیریت و تایید پرداخت‌های دستی</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs text-slate-500">کل تراکنش‌ها</div>
          <div className="mt-2 text-xl font-black">{bookings.length.toLocaleString("fa-IR")}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500">درآمد جلسات</div>
          <div className="mt-2 text-xl font-black">{formatIRR(totalRevenue)}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500">در انتظار تایید</div>
          <div className="mt-2 text-xl font-black">
            {bookings.filter(b => b.paymentStatus === "pending_review").length.toLocaleString("fa-IR")}
          </div>
        </div>
      </div>

      <form className="flex gap-2 flex-wrap" action="/admin/bookings">
        <select name="status" defaultValue={statusFilter} className="input w-auto">
          <option value="">همه وضعیت‌ها</option>
          <option value="unpaid">پرداخت نشده</option>
          <option value="pending_review">در انتظار تایید</option>
          <option value="paid">پرداخت شده</option>
        </select>
        <button className="btn-ghost">اعمال فیلتر</button>
        {statusFilter && (
          <Link href="/admin/bookings" className="btn-ghost text-sm">
            حذف فیلتر
          </Link>
        )}
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs">
            <tr>
              <th className="px-3 py-3 text-right">تاریخ</th>
              <th className="px-3 py-3 text-right">کاربر</th>
              <th className="px-3 py-3 text-right">مشاور</th>
              <th className="px-3 py-3 text-right">ساعت</th>
              <th className="px-3 py-3 text-right">مبلغ</th>
              <th className="px-3 py-3 text-right">وضعیت</th>
              <th className="px-3 py-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className="border-t border-slate-100">
                <td className="px-3 py-2 text-xs">{formatDate(b.createdAt)}</td>
                <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                  {b.user ? b.user.phone : "—"}
                </td>
                <td className="px-3 py-2 text-xs">{b.consultant.displayName}</td>
                <td className="px-3 py-2 text-xs">{b.hours}</td>
                <td className="px-3 py-2 text-xs">{formatIRR(b.amount)}</td>
                <td className="px-3 py-2 text-xs">
                  <span
                    className={`rounded px-2 py-0.5 ${
                      b.paymentStatus === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : b.paymentStatus === "pending_review"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100"
                    }`}
                  >
                    {statusMap[b.paymentStatus] || b.paymentStatus}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {b.paymentStatus === "pending_review" && (
                    <ConfirmPayment bookingId={b.id} />
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center muted">
                  تراکنشی نیست
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}