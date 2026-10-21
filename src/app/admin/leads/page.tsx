import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminLeads() {
  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return (
    <div className="space-y-4">
      <div>
        <h1 className="h2">لیدها</h1>
        <p className="muted mt-1 text-sm">شماره‌هایی که از فرم‌های سایت ثبت شده‌اند</p>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs">
            <tr>
              <th className="px-3 py-3 text-right">شماره</th>
              <th className="px-3 py-3 text-right">صنف</th>
              <th className="px-3 py-3 text-right">منبع</th>
              <th className="px-3 py-3 text-right">تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-mono" dir="ltr">{l.phone}</td>
                <td className="px-3 py-2">{l.industry || "—"}</td>
                <td className="px-3 py-2">{l.source || "—"}</td>
                <td className="px-3 py-2">
                  {new Date(l.createdAt).toLocaleDateString("fa-IR")}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center muted">
                  لیدی نیست
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}