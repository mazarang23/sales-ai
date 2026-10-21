import { getCurrentConsultant } from "@/lib/consultant-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatIRR, formatNum, formatDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ConsultantTransactionsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const consultant = await getCurrentConsultant();
  if (!consultant) redirect("/consultant/login");

  const sp = await searchParams;
  const statusFilter = sp.status || "";

  const where = {
    consultantId: consultant.id,
    ...(statusFilter ? { paymentStatus: statusFilter } : {})
  };

  const bookings = await db.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { phone: true, name: true } } }
  });

  const paidBookings = bookings.filter(b => b.paymentStatus === "paid");
  const totalRevenue = paidBookings.reduce((s, b) => s + b.amount * 0.8, 0);
  const totalCommission = paidBookings.reduce((s, b) => s + b.amount * 0.2, 0);

  const statusMap: Record<string, string> = {
    unpaid: "پرداخت نشده",
    pending_review: "در انتظار تایید",
    paid: "پرداخت شده"
  };

  return (
    <div className="container-tight py-10 space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="h2">تراکنش‌های من</h1>
          <p className="muted mt-1 text-sm">درآمد و کمیسیون هر جلسه</p>
        </div>
        <Link href="/consultant/dashboard" className="btn-ghost text-sm">
          بازگشت به داشبورد
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs text-slate-500">درآمد کل (۸۰٪)</div>
          <div className="mt-2 text-xl font-black">{formatIRR(totalRevenue)}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500">کمیسیون پلتفرم (۲۰٪)</div>
          <div className="mt-2 text-xl font-black">{formatIRR(totalCommission)}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500">جلسات پرداخت‌شده</div>
          <div className="mt-2 text-xl font-black">{formatNum(paidBookings.length)}</div>
        </div>
      </div>

      <form className="flex gap-2 flex-wrap" action="/consultant/transactions">
        <select name="status" defaultValue={statusFilter} className="input w-auto">
          <option value="">همه وضعیت‌ها</option>
          <option value="paid">پرداخت شده</option>
          <option value="pending_review">در انتظار تایید</option>
          <option value="unpaid">پرداخت نشده</option>
        </select>
        <button className="btn-ghost">اعمال فیلتر</button>
        {statusFilter && (
          <Link href="/consultant/transactions" className="btn-ghost text-sm">
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
              <th className="px-3 py-3 text-right">ساعت</th>
              <th className="px-3 py-3 text-right">مبلغ</th>
              <th className="px-3 py-3 text-right">سهم شما (۸۰٪)</th>
              <th className="px-3 py-3 text-right">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className="border-t border-slate-100">
                <td className="px-3 py-2 text-xs">{formatDate(b.createdAt)}</td>
                <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                  {b.user ? b.user.phone : "—"}
                </td>
                <td className="px-3 py-2 text-xs">{b.hours}</td>
                <td className="px-3 py-2 text-xs">{formatIRR(b.amount)}</td>
                <td className="px-3 py-2 text-xs font-medium">
                  {b.paymentStatus === "paid" ? formatIRR(b.amount * 0.8) : "—"}
                </td>
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
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center muted">
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