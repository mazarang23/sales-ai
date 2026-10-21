import { db } from "@/lib/db";
import { formatNum, formatDate } from "@/lib/utils";
import { PlanToggle } from "@/components/admin/PlanToggle";

export const dynamic = "force-dynamic";

const PLAN_LABELS: Record<string, string> = {
  free: "رایگان",
  pro: "رشد",
  business: "حرفه‌ای"
};

export default async function AdminPlansPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      phone: true,
      name: true,
      plan: true,
      planExpiresAt: true,
      aiQuestionsUsed: true,
      aiQuestionsLimit: true,
      createdAt: true
    }
  });

  const freeCount = users.filter(u => u.plan === "free").length;
  const proCount = users.filter(u => u.plan === "pro").length;
  const businessCount = users.filter(u => u.plan === "business").length;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="h2">پلن‌های کاربران</h1>
        <p className="muted mt-1 text-sm">مدیریت پلن و سهمیه سوالات AI</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs text-slate-500">رایگان</div>
          <div className="mt-2 text-xl font-black">{formatNum(freeCount)}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500">رشد</div>
          <div className="mt-2 text-xl font-black">{formatNum(proCount)}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500">حرفه‌ای</div>
          <div className="mt-2 text-xl font-black">{formatNum(businessCount)}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs">
            <tr>
              <th className="px-3 py-3 text-right">شماره</th>
              <th className="px-3 py-3 text-right">نام</th>
              <th className="px-3 py-3 text-right">پلن</th>
              <th className="px-3 py-3 text-right">انقضا</th>
              <th className="px-3 py-3 text-right">سوالات AI</th>
              <th className="px-3 py-3 text-right">عضویت</th>
              <th className="px-3 py-3 text-right">تغییر</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const expired = u.planExpiresAt && u.planExpiresAt < new Date();
              return (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                    {u.phone}
                  </td>
                  <td className="px-3 py-2">{u.name || "—"}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        u.plan === "business"
                          ? "bg-purple-50 text-purple-700"
                          : u.plan === "pro"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100"
                      }`}
                    >
                      {PLAN_LABELS[u.plan] || u.plan}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {u.planExpiresAt ? (
                      <span className={expired ? "text-red-600" : ""}>
                        {formatDate(u.planExpiresAt)}
                        {expired && " (منقضی)"}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {formatNum(u.aiQuestionsUsed)} / {formatNum(u.aiQuestionsLimit)}
                  </td>
                  <td className="px-3 py-2 text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-3 py-2">
                    <PlanToggle userId={u.id} currentPlan={u.plan} />
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center muted">
                  کاربری نیست
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}