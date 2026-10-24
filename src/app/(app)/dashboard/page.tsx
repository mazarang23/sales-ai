import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatNum, formatDate } from "@/lib/utils";
import { AppNav } from "@/components/app/AppNav";
import { UploadDisplayName } from "@/components/app/UploadDisplayName";
import { getAiQuestionsLimit, getExplainLimit, getGrowthPlansLimit, getEffectivePlan, PLANS } from "@/lib/plans";

export const dynamic = "force-dynamic";
export default async function DashboardHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const activePlan = getEffectivePlan(user);
  const [uploads, assistantUsed, explainUsed, growthUsed] = await Promise.all([
    db.upload.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.chatMessage.count({ where: { userId: user.id, role: "user", createdAt: { gte: monthStart } } }),
    db.insight.count({ where: { kind: "explain", createdAt: { gte: monthStart }, upload: { userId: user.id } } }),
    db.recommendation.count({ where: { createdAt: { gte: monthStart }, upload: { userId: user.id } } })
  ]);
  const plan = PLANS[activePlan];
  const limits = { ai: getAiQuestionsLimit(activePlan), explain: getExplainLimit(activePlan), growth: getGrowthPlansLimit(activePlan) };
  return <>
    <AppNav current="dashboard" />
    <div className="container-tight py-10" dir="rtl">
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap"><div><div className="text-xs text-slate-500">پلن فعلی</div><div className="text-lg font-black">{plan.label}</div><p className="text-xs text-slate-500 mt-1">سهمیه‌ها برای هر ماه تقویمی محاسبه می‌شوند.</p></div><Link href="/account/upgrade" className="btn-ghost text-sm">{activePlan === "free" ? "ارتقای پلن" : "تمدید یا ارتقا"}</Link></div>
        <div className="grid gap-3 sm:grid-cols-3 mt-4"><Usage label="سوال از دستیار" used={assistantUsed} max={limits.ai} /><Usage label="برنامه رشد" used={growthUsed} max={limits.growth} /><Usage label="توضیح بیشتر" used={explainUsed} max={limits.explain} /></div>
      </div>
      {uploads.length === 0 ? <><h1 className="h2">سلام {user.name || user.phone}</h1><p className="muted mt-2">برای شروع، فایل فروش را آپلود کن تا شاخص‌ها و فرصت‌های رشد را ببینی.</p><div className="mt-6 flex gap-2 flex-wrap"><Link href="/upload" className="btn-primary">آپلود فایل فروش</Link><Link href="/bookings" className="btn-ghost">جلسات من</Link></div></> : <><div className="flex items-center justify-between flex-wrap gap-3"><div><h1 className="h2">فایل‌های تحلیل</h1><p className="muted mt-1 text-sm">آپلودهای اخیر تو</p></div><Link href="/upload" className="btn-primary text-sm">آپلود جدید</Link></div><div className="mt-6 space-y-2">{uploads.map(u => <div key={u.id} className="card p-4 flex items-center justify-between flex-wrap gap-3"><div><UploadDisplayName id={u.id} initialName={u.displayName || u.fileName} /><div className="text-xs text-slate-500 mt-1">{formatDate(u.createdAt)} — {formatNum(u.rowCount)} ردیف</div></div><div className="flex gap-2 flex-wrap"><Link href={`/mapping/${u.id}`} className="btn-ghost text-xs">ستون‌ها</Link><Link href={`/dashboard/${u.id}`} className="btn-primary text-xs">تحلیل</Link><Link href="/consultants" className="btn-ghost text-xs text-emerald-700 border-emerald-300">رزرو مشاور</Link></div></div>)}</div></>}
    </div>
  </>;
}
function Usage({ label, used, max }: { label: string; used: number; max: number }) { return <div className="rounded-xl border border-slate-200 p-3"><div className="flex justify-between text-xs"><span>{label}</span><span>{formatNum(used)} / {formatNum(max)}</span></div><div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-brand-500" style={{ width: `${max > 0 ? Math.min(100, used / max * 100) : 0}%` }} /></div></div>; }
