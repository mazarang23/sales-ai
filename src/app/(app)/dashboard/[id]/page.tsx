import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { computeKpis, topBy } from "@/lib/analytics/kpi";
import { computeRfm } from "@/lib/analytics/rfm";
import { formatMoney, formatNum, formatDate } from "@/lib/utils";
import { currencyLabel, Currency } from "@/lib/excel/currency";
import { SalesChart } from "@/components/charts/SalesChart";
import { GrowthPanel } from "@/components/app/GrowthPanel";
import { AssistantChat } from "@/components/app/AssistantChat";
import { ChatHistory } from "@/components/app/ChatHistory";
import { ReportButton } from "@/components/app/ReportButton";
import { FeedbackPopup } from "@/components/app/FeedbackPopup";
import { DeleteUploadButton } from "@/components/app/DeleteUploadButton";
import { AppNav } from "@/components/app/AppNav";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const upload = await db.upload.findFirst({ where: { id, userId: user.id }, include: { mappings: true } });
  if (!upload) notFound();

  const currency = (((upload.mappings?.fieldMap as any)?._currency || "rial") as Currency);
  const money = (value: number | null | undefined) => formatMoney(value, currency);
  const rows = await db.dataRow.findMany({ where: { uploadId: upload.id } });
  const kpis = computeKpis(rows as any);
  const topProducts = topBy(rows as any, "product", 8);
  const rfm = computeRfm(rows as any);
  const seg = rfm.reduce((acc, x) => { acc[x.segment] = (acc[x.segment] || 0) + 1; return acc; }, {} as Record<string, number>);
  const existingRec = await db.recommendation.findFirst({ where: { uploadId: upload.id }, orderBy: { createdAt: "desc" } });

  return <>
    <AppNav current="dashboard" />
    <div className="container-tight py-10 space-y-8" dir="rtl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="h2">داشبورد</h1><p className="muted mt-1 text-sm">{upload.fileName} — {formatNum(upload.rowCount)} ردیف — {formatDate(upload.createdAt)}</p><p className="mt-1 text-xs text-slate-500">واحد نمایش مبالغ: {currencyLabel(currency)}</p></div>
        <div className="flex gap-2 flex-wrap"><ReportButton uploadId={upload.id} /><DeleteUploadButton uploadId={upload.id} /><Link href="/upload" className="btn-ghost text-xs sm:text-sm">آپلود جدید</Link><Link href="/consultants" className="btn-primary text-xs sm:text-sm">رزرو مشاور</Link></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Kpi label="فروش کل" value={money(kpis.total)} /><Kpi label="تعداد سفارش" value={formatNum(kpis.orders)} /><Kpi label="مشتری یکتا" value={formatNum(kpis.customers)} /><Kpi label="میانگین سبد" value={money(kpis.aov)} /></div>
      <div className="card p-6"><div className="font-bold mb-4">روند فروش</div><SalesChart rows={rows.map(r => ({ date: r.date ? r.date.toISOString() : null, amount: r.amount ?? 0 }))} /></div>
      <div><div className="font-bold mb-4">تحلیل‌های دقیق</div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href={`/customers/${upload.id}`} className="card p-5 hover:shadow-glow transition"><div className="text-2xl">👥</div><div className="mt-2 font-bold">مشتریان</div><div className="muted text-sm mt-1">{formatNum(kpis.customers)} مشتری</div></Link>
        <Link href={`/rfm/${upload.id}`} className="card p-5 hover:shadow-glow transition"><div className="text-2xl">🎯</div><div className="mt-2 font-bold">تحلیل RFM</div><div className="muted text-sm mt-1">{formatNum(Object.keys(seg).length)} سگمنت</div></Link>
        <Link href={`/cohort/${upload.id}`} className="card p-5 hover:shadow-glow transition"><div className="text-2xl">📊</div><div className="mt-2 font-bold">تحلیل کوهورت</div><div className="muted text-sm mt-1">رفتار مشتریان</div></Link>
        <Link href={`/products/${upload.id}`} className="card p-5 hover:shadow-glow transition"><div className="text-2xl">📦</div><div className="mt-2 font-bold">محصولات</div><div className="muted text-sm mt-1">{formatNum(topProducts.length)} محصول</div></Link>
      </div></div>
      <div className="card p-6"><div className="flex items-center justify-between mb-4"><div className="font-bold">پرفروش‌ترین محصولات</div><Link href={`/products/${upload.id}`} className="text-sm text-brand-600">همه محصولات</Link></div><div className="space-y-2">{topProducts.slice(0, 5).map((p, i) => <div key={p.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><div className="flex items-center gap-3"><span className="text-xs text-slate-500">#{i + 1}</span><span className="text-sm truncate max-w-[180px]">{p.name}</span></div><span className="text-sm font-medium">{money(p.amount)}</span></div>)}{topProducts.length === 0 && <div className="muted text-sm">داده محصول موجود نیست</div>}</div></div>
      <GrowthPanel uploadId={upload.id} existingRecommendation={existingRec?.actions as any} /><AssistantChat uploadId={upload.id} />
      <details className="card p-6"><summary className="cursor-pointer font-bold">تاریخچه مکالمات</summary><div className="mt-4"><ChatHistory uploadId={upload.id} /></div></details>
      <FeedbackPopup uploadId={upload.id} feedbackGiven={user.feedbackGiven} />
    </div>
  </>;
}
function Kpi({ label, value }: { label: string; value: string }) { return <div className="card p-5"><div className="text-xs text-slate-500">{label}</div><div className="mt-2 text-2xl font-black">{value}</div></div>; }
