import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatNum, formatDate } from "@/lib/utils";
import { AppNav } from "@/components/app/AppNav";
import { getAiQuestionsLimit, getExplainLimit, getGrowthPlansLimit, getPlan } from "@/lib/plans";
import { getAiUsageSummary, getAiEconomicsConfig } from "@/lib/ai/usage";

export const dynamic = "force-dynamic";
export default async function DashboardHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const [uploads, usage, explainUsed, growthUsed] = await Promise.all([
    db.upload.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    getAiUsageSummary(user.id, monthStart),
    db.insight.count({ where: { kind: "explain", createdAt: { gte: monthStart }, upload: { userId: user.id } } }),
    db.recommendation.count({ where: { createdAt: { gte: monthStart }, upload: { userId: user.id } } })
  ]);
  const plan = getPlan(user.plan);
  const limits = { ai: getAiQuestionsLimit(user.plan), explain: getExplainLimit(user.plan), growth: getGrowthPlansLimit(user.plan) };
  const econ = getAiEconomicsConfig();
  return <>
    <AppNav current="dashboard" />
    <div className="container-tight py-10" dir="rtl">
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap"><div><div className="text-xs text-slate-500">پلن فعلی</div><div className="text-lg font-black">{plan.label}</div></div><div className="text-sm text-slate-600">مصرف AI این ماه: {formatNum(usage.totalTokens)} توکن</div></div>
        <div className="grid gap-3 sm:grid-cols-3 mt-4"><Usage label="سوال از دستیار" used={user.aiQuestionsUsed} max={limits.ai} /><Usage label="برنامه رشد" used={growthUsed} max={limits.growth} /><Usage label="توضیح بیشتر" used={explainUsed} max={limits.explain} /></div>
        {user.plan !== "free" && <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm"><div className="flex justify-between gap-3"><span>اعتبار هوش مصنوعی</span><strong>{formatNum(user.walletBalance)} تومان</strong></div><div className="text-xs text-slate-500 mt-1">هزینه بر اساس توکن مصرفی محاسبه می‌شود.{econ.configured ? "" : " نرخ تبدیل دلار باید در تنظیمات سرور تعیین شود."}</div></div>}
        <div className="text-xs text-slate-400 mt-3">{formatNum(usage.requests)} درخواست، {formatNum(usage.promptTokens)} توکن ورودی و {formatNum(usage.completionTokens)} توکن خروجی در این ماه</div>
      </div>
      {uploads.length === 0 ? <><h1 className="h2">سلام {user.name || user.phone}</h1><p className="muted mt-2">هنوز فایلی آپلود نکردی.</p><div className="mt-6 flex gap-2 flex-wrap"><Link href="/upload" className="btn-primary">آپلود فایل فروش</Link><Link href="/bookings" className="btn-ghost">جلسات من</Link></div></> : <><div className="flex items-center justify-between flex-wrap gap-3"><div><h1 className="h2">داشبورد</h1><p className="muted mt-1 text-sm">آپلودهای اخیر تو</p></div><Link href="/upload" className="btn-primary text-sm">آپلود جدید</Link></div><div className="mt-6 space-y-2">{uploads.map(u => <div key={u.id} className="card p-4 flex items-center justify-between flex-wrap gap-3"><div><div className="font-medium truncate max-w-[300px]">{u.fileName}</div><div className="text-xs text-slate-500 mt-1">{formatDate(u.createdAt)} — {formatNum(u.rowCount)} ردیف</div></div><div className="flex gap-2 flex-wrap"><Link href={`/mapping/${u.id}`} className="btn-ghost text-xs">ستون‌ها</Link><Link href={`/dashboard/${u.id}`} className="btn-primary text-xs">تحلیل</Link><Link href="/consultants" className="btn-ghost text-xs text-emerald-700 border-emerald-300">رزرو مشاور</Link></div></div>)}</div></>}
    </div>
  </>;
}
function Usage({ label, used, max }: { label: string; used: number; max: number }) { return <div className="rounded-xl border border-slate-200 p-3"><div className="flex justify-between text-xs"><span>{label}</span><span>{formatNum(used)} / {formatNum(max)}</span></div><div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-brand-500" style={{ width: `${max > 0 ? Math.min(100, used / max * 100) : 0}%` }} /></div></div>; }
