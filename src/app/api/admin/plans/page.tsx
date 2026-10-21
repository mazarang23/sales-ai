import { db } from "@/lib/db";
import { PlanToggle } from "@/components/admin/PlanToggle";

export const dynamic = "force-dynamic";

export default async function AdminPlans() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, phone: true, name: true, plan: true, aiQuestionsUsed: true, aiQuestionsLimit: true }
  });

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="h2">پلن‌های کاربران</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs">
            <tr>
              <th className="px-3 py-3 text-right">شماره</th>
              <th className="px-3 py-3 text-right">نام</th>
              <th className="px-3 py-3 text-right">پلن</th>
              <th className="px-3 py-3 text-right">سوالات AI</th>
              <th className="px-3 py-3 text-right">تغییر</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-mono text-xs" dir="ltr">{u.phone}</td>
                <td className="px-3 py-2">{u.name || "—"}</td>
                <td className="px-3 py-2">
                  <span className={`rounded px-2 py-0.5 text-xs ${u.plan === "pro" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100"}`}>
                    {u.plan === "pro" ? "حرفه‌ای" : "رایگان"}
                  </span>
                </td>
                <td className="px-3 py-2">{u.aiQuestionsUsed} / {u.aiQuestionsLimit}</td>
                <td className="px-3 py-2">
                  <PlanToggle userId={u.id} currentPlan={u.plan} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}