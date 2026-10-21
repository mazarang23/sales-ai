import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminTickets() {
  const tickets = await db.ticket.findMany({
    orderBy: { createdAt: "desc" },
    take: 500
  });

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="h2">تیکت‌ها و بازخوردها</h1>
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
                <td className="px-3 py-2 font-mono text-xs" dir="ltr">{t.phone}</td>
                <td className="px-3 py-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{t.type}</span>
                </td>
                <td className="px-3 py-2">{t.rating ? `${t.rating}/5` : "—"}</td>
                <td className="px-3 py-2 truncate max-w-[300px]">{t.message}</td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center muted">تیکتی نیست</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}