import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ConsultantApprove } from "@/components/admin/ConsultantApprove";

export const dynamic = "force-dynamic";

export default async function AdminConsultants() {
  const consultants = await db.consultant.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { phone: true, name: true } } }
  });

  const pending = consultants.filter(c => c.status === "pending");
  const others = consultants.filter(c => c.status !== "pending");

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="h2">مشاورین</h1>
        <p className="muted mt-1 text-sm">تایید درخواست‌ها و کنترل فعال/غیرفعال بودن پروفایل مشاورین در سایت</p>
      </div>

      <div>
        <h2 className="font-bold mb-2">در انتظار تایید ({pending.length})</h2>
        <div className="space-y-3">
          {pending.map(c => (
            <div key={c.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{c.displayName}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    <span dir="ltr">{c.phone}</span>
                    {c.user && <span className="mr-2">(کاربر مرتبط: <span dir="ltr">{c.user.phone}</span>)</span>}
                    {" — "}
                    {formatDate(c.createdAt)}
                  </div>
                  <div className="text-sm mt-2">{c.bio}</div>
                  <div className="text-xs text-slate-500 mt-2">تعرفه: {c.hourlyRate.toLocaleString("fa-IR")} تومان/ساعت</div>
                </div>
                <ConsultantApprove consultantId={c.id} status={c.status} />
              </div>
            </div>
          ))}
          {pending.length === 0 && <div className="card p-4 muted text-sm">درخواستی نیست</div>}
        </div>
      </div>

      <div>
        <h2 className="font-bold mb-2">مدیریت وضعیت مشاورین</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs">
              <tr>
                <th className="px-3 py-3 text-right">نام</th>
                <th className="px-3 py-3 text-right">شماره مشاور</th>
                <th className="px-3 py-3 text-right">کاربر مرتبط</th>
                <th className="px-3 py-3 text-right">تعرفه</th>
                <th className="px-3 py-3 text-right">وضعیت</th>
                <th className="px-3 py-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {others.map(c => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{c.displayName}</td>
                  <td className="px-3 py-2 font-mono text-xs" dir="ltr">{c.phone}</td>
                  <td className="px-3 py-2 font-mono text-xs" dir="ltr">{c.user ? c.user.phone : "—"}</td>
                  <td className="px-3 py-2">{c.hourlyRate.toLocaleString("fa-IR")}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${c.status === "approved" ? "bg-emerald-50 text-emerald-700" : c.status === "approved_hidden" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                      {c.status === "approved" ? "فعال در سایت" : c.status === "approved_hidden" ? "غیرفعال در سایت" : "رد شده"}
                    </span>
                  </td>
                  <td className="px-3 py-2"><ConsultantApprove consultantId={c.id} status={c.status} /></td>
                </tr>
              ))}
              {others.length === 0 && <tr><td colSpan={6} className="p-6 text-center muted">هنوز مشاور تایید یا رد نشده</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
