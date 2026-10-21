import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage({
  searchParams
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const sp = await searchParams;
  const typeFilter = sp.type || "";

  const where = typeFilter ? { type: typeFilter } : {};

  const tickets = await db.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500
  });

  const reports = tickets.filter(t => t.type === "report").length;
  const feedbacks = tickets.filter(t => t.type === "feedback").length;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="h2">تیکت‌ها و بازخوردها</h1>
        <p className="muted mt-1 text-sm">گزارش‌های خرابی و امتیازهای کاربران</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs text-slate-500">کل تیکت‌ها</div>
          <div className="mt-2 text-xl font-black">{tickets.length.toLocaleString("fa-IR")}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500">گزارش خرابی</div>
          <div className="mt-2 text-xl font-black">{reports.toLocaleString("fa-IR")}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500">بازخورد</div>
          <div className="mt-2 text-xl font-black">{feedbacks.toLocaleString("fa-IR")}</div>
        </div>
      </div>

      <form className="flex gap-2 flex-wrap" action="/admin/tickets">
        <select name="type" defaultValue={typeFilter} className="input w-auto">
          <option value="">همه</option>
          <option value="report">گزارش خرابی</option>
          <option value="feedback">بازخورد</option>
        </select>
        <button className="btn-ghost">اعمال فیلتر</button>
        {typeFilter && (
          <Link href="/admin/tickets" className="btn-ghost text-sm">
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
              <th className="px-3 py-3 text-right">نوع</th>
              <th className="px-3 py-3 text-right">امتیاز</th>
              <th className="px-3 py-3 text-right">متن</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id} className="border-t border-slate-100">
                <td className="px-3 py-2 text-xs">{formatDate(t.createdAt)}</td>
                <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                  {t.phone}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      t.type === "report"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {t.type === "report" ? "گزارش خرابی" : "بازخورد"}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs">
                  {t.rating ? `${t.rating}/5` : "—"}
                </td>
                <td className="px-3 py-2 text-xs truncate max-w-[400px]">
                  {t.message}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center muted">
                  تیکتی نیست
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}