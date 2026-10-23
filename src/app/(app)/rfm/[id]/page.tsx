import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { computeRfm } from "@/lib/analytics/rfm";
import { formatNum, formatIRR } from "@/lib/utils";
import { getOrComputeAnalytics, ANALYTICS_VERSIONS } from "@/lib/analytics/cache";
import { BackButton } from "@/components/app/BackButton";
import { AppNav } from "@/components/app/AppNav";
import Link from "next/link";

export const dynamic = "force-dynamic";

const SEGMENT_INFO: Record<string, { label: string; desc: string; color: string }> = {
  Champions: { label: "Champions", desc: "وفادارترین مشتریان، اخیر و پرخرید", color: "bg-emerald-50 text-emerald-700" },
  Loyal: { label: "Loyal", desc: "مشتریان وفادار با خرید منظم", color: "bg-blue-50 text-blue-700" },
  Potential: { label: "Potential", desc: "بالقوه، نیاز به فعال‌سازی", color: "bg-amber-50 text-amber-700" },
  AtRisk: { label: "AtRisk", desc: "در خطر ریزش، نیاز به بازگشت", color: "bg-orange-50 text-orange-700" },
  Lost: { label: "Lost", desc: "از دست رفته، نیاز به احیا", color: "bg-red-50 text-red-700" }
};

export default async function RfmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const upload = await db.upload.findFirst({ where: { id, userId: user.id }, include: { mappings: true } });
  if (!upload) notFound();

  const mapping = upload.mappings?.fieldMap ?? {};
  const rows = await db.dataRow.findMany({ where: { uploadId: upload.id } });
  const result = await getOrComputeAnalytics({
    uploadId: upload.id,
    kind: "rfm_v2",
    mapping,
    algorithmVersion: ANALYTICS_VERSIONS.rfm,
    compute: () => computeRfm(rows as any)
  });
  const rfm = result.data;

  const bySegment: Record<string, typeof rfm> = {};
  for (const c of rfm) (bySegment[c.segment] = bySegment[c.segment] || []).push(c);
  const totalCustomers = rfm.length;

  return (
    <>
      <AppNav current="dashboard" />
      <div className="container-tight py-10 space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <BackButton href={`/dashboard/${upload.id}`} label="بازگشت به داشبورد" />
          <Link href={`/customers/${upload.id}`} className="btn-ghost text-sm">همه مشتریان</Link>
        </div>
        <div>
          <h1 className="h2">تحلیل RFM</h1>
          <p className="muted mt-1 text-sm">بخش‌بندی {formatNum(totalCustomers)} مشتری بر اساس تازگی، تکرار و مبلغ خرید</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(SEGMENT_INFO).map(([key, info]) => {
            const customers = bySegment[key] || [];
            const revenue = customers.reduce((s, c) => s + c.sum, 0);
            return <Link key={key} href={`/customers/${upload.id}?segment=${encodeURIComponent(key)}`} className="card p-5 hover:shadow-glow transition">
              <div className={`inline-block rounded-lg px-2 py-0.5 text-xs ${info.color}`}>{info.label}</div>
              <div className="mt-3 text-3xl font-black">{formatNum(customers.length)}</div>
              <div className="muted text-xs mt-1">{info.desc}</div>
              <div className="text-xs text-slate-500 mt-3">مجموع درآمد: {formatIRR(revenue)}</div>
              {customers.length > 0 && <div className="text-xs text-slate-400 mt-2 leading-5 border-t border-slate-100 pt-2">نمونه دلیل: {customers[0].segmentReason}</div>}
            </Link>;
          })}
        </div>
        <div className="card p-6">
          <div className="font-bold mb-4">توزیع سگمنت‌ها</div>
          <div className="space-y-2">
            {Object.entries(SEGMENT_INFO).map(([key, info]) => {
              const count = (bySegment[key] || []).length;
              const pct = totalCustomers > 0 ? Math.round((count / totalCustomers) * 100) : 0;
              return <div key={key} className="flex items-center gap-3">
                <div className="w-24 text-xs text-slate-600">{info.label}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden"><div className="h-full bg-brand-500 rounded-full flex items-center justify-end px-2" style={{ width: `${pct}%` }}><span className="text-xs text-white font-medium">{pct}%</span></div></div>
                <div className="w-16 text-xs text-slate-500 text-left">{formatNum(count)}</div>
              </div>;
            })}
          </div>
        </div>
      </div>
    </>
  );
}
