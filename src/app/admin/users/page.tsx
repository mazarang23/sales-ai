import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatNum, formatDate } from "@/lib/utils";
import { RoleToggle } from "@/components/admin/RoleToggle";
import { PlanToggle } from "@/components/admin/PlanToggle";
import { getAiQuestionsLimit, getExplainLimit, getGrowthPlansLimit } from "@/lib/plans";

export const dynamic = "force-dynamic";
const PLAN_LABELS: Record<string, string> = { free: "رایگان", pro: "رشد", business: "حرفه‌ای" };
export default async function AdminUsers() {
  const current = await getCurrentUser();
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" }, take: 500, include: { _count: { select: { uploads: true } } } });
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const [aiRows, questionRows, explainRows, growthRows] = await Promise.all([
    db.insight.findMany({ where: { kind: "ai_usage", createdAt: { gte: monthStart } }, select: { payload: true } }),
    db.chatMessage.findMany({ where: { role: "user", createdAt: { gte: monthStart } }, select: { userId: true } }),
    db.insight.findMany({ where: { kind: "explain", createdAt: { gte: monthStart }, upload: { userId: { in: users.map(u => u.id) } } }, select: { upload: { select: { userId: true } } } }),
    db.recommendation.findMany({ where: { createdAt: { gte: monthStart }, upload: { userId: { in: users.map(u => u.id) } } }, select: { upload: { select: { userId: true } } } })
  ]);
  const byUser = new Map<string, { tokens: number; promptTokens: number; completionTokens: number; costUsd: number; costToman: number; chargedToman: number; questions: number; explain: number; growth: number }>();
  const get = (id: string) => { const x = byUser.get(id) || { tokens: 0, promptTokens: 0, completionTokens: 0, costUsd: 0, costToman: 0, chargedToman: 0, questions: 0, explain: 0, growth: 0 }; byUser.set(id, x); return x; };
  for (const r of aiRows) { const p = r.payload as any; if (p?.userId) { const x = get(p.userId); x.tokens += Number(p.totalTokens || 0); x.promptTokens += Number(p.promptTokens || 0); x.completionTokens += Number(p.completionTokens || 0); x.costUsd += Number(p.costUsd || 0); x.costToman += Number(p.costToman || 0); x.chargedToman += Number(p.chargedToman || 0); } }
  for (const r of questionRows) get(r.userId).questions++;
  for (const r of explainRows) get(r.upload.userId).explain++;
  for (const r of growthRows) get(r.upload.userId).growth++;

  return <div className="space-y-4">
    <div><h1 className="h2">کاربران</h1><p className="muted mt-1 text-sm">پلن، محدودیت و مصرف ماه جاری هر کاربر را یکجا ببین.</p></div>
    <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[1750px] text-sm"><thead className="bg-slate-50 text-xs"><tr><th className="px-3 py-3 text-right">شماره</th><th className="px-3 py-3 text-right">نام</th><th className="px-3 py-3 text-right">پلن</th><th className="px-3 py-3 text-right">سوال AI</th><th className="px-3 py-3 text-right">برنامه رشد</th><th className="px-3 py-3 text-right">توضیح</th><th className="px-3 py-3 text-right">توکن</th><th className="px-3 py-3 text-right">ورودی</th><th className="px-3 py-3 text-right">خروجی</th><th className="px-3 py-3 text-right">هزینه دلار</th><th className="px-3 py-3 text-right">هزینه تومان</th><th className="px-3 py-3 text-right">کسرشده</th><th className="px-3 py-3 text-right">اعتبار</th><th className="px-3 py-3 text-right">آپلود</th><th className="px-3 py-3 text-right">نقش</th><th className="px-3 py-3 text-right">جزئیات</th></tr></thead><tbody>{users.map(u => { const x = byUser.get(u.id) || { tokens: 0, promptTokens: 0, completionTokens: 0, costUsd: 0, costToman: 0, chargedToman: 0, questions: 0, explain: 0, growth: 0 }; return <tr key={u.id} className="border-t border-slate-100"><td className="px-3 py-2 font-mono text-xs" dir="ltr">{u.phone}</td><td className="px-3 py-2">{u.name || "—"}</td><td className="px-3 py-2"><div className="flex items-center gap-2"><span className="hidden sm:inline rounded bg-slate-50 px-2 py-0.5 text-xs">{PLAN_LABELS[u.plan] || u.plan}</span><PlanToggle userId={u.id} currentPlan={u.plan} /></div></td><td className="px-3 py-2">{formatNum(x.questions)} / {formatNum(getAiQuestionsLimit(u.plan))}</td><td className="px-3 py-2">{formatNum(x.growth)} / {formatNum(getGrowthPlansLimit(u.plan))}</td><td className="px-3 py-2">{formatNum(x.explain)} / {formatNum(getExplainLimit(u.plan))}</td><td className="px-3 py-2">{formatNum(x.tokens)}</td><td className="px-3 py-2">{formatNum(x.promptTokens)}</td><td className="px-3 py-2">{formatNum(x.completionTokens)}</td><td className="px-3 py-2">${x.costUsd.toFixed(6)}</td><td className="px-3 py-2">{formatNum(Math.round(x.costToman))}</td><td className="px-3 py-2">{formatNum(Math.round(x.chargedToman))}</td><td className="px-3 py-2">{formatNum(u.walletBalance)} تومان</td><td className="px-3 py-2">{formatNum(u._count.uploads)}</td><td className="px-3 py-2"><RoleToggle userId={u.id} currentRole={u.role} isSelf={current?.id === u.id} /></td><td className="px-3 py-2"><Link href={`/admin/users/${u.id}`} className="text-brand-600 text-xs">مشاهده</Link><div className="text-xs text-slate-400 mt-1">{formatDate(u.createdAt)}</div></td></tr>; })}</tbody></table></div></div>
  </div>;
}
