import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { computeCohort } from "@/lib/analytics/cohort";
import { Period } from "@/lib/analytics/periods";
import { CohortTable } from "@/components/app/CohortTable";
import { PeriodToggle } from "@/components/charts/PeriodToggle";
import { BackButton } from "@/components/app/BackButton";
import { AppNav } from "@/components/app/AppNav";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CohortPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ period?: string; product?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const period = (["day", "week", "month"].includes(sp.period || "") ? sp.period : "month") as Period;
  const product = sp.product || "";

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const upload = await db.upload.findFirst({ where: { id, userId: user.id } });
  if (!upload) notFound();

  const rows = await db.dataRow.findMany({ where: { uploadId: upload.id } });
  const products = [...new Set(rows.map(r => r.product).filter(Boolean))].sort();
  const cohorts = computeCohort(rows as any, period, product || undefined);

  return (
    <>
      <AppNav current="dashboard" />
      <div className="container-tight py-10" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <BackButton href={`/dashboard/${upload.id}`} label="بازگشت به داشبورد" />
        </div>

        <h1 className="h2">تحلیل کوهورت</h1>
        <p className="muted mt-1 text-sm">رفتار مشتریان بر اساس اولین خریدشان</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <PeriodToggle current={period} />
          <form className="flex items-center gap-2" action={`/cohort/${upload.id}`}>
            <input type="hidden" name="period" value={period} />
            <select name="product" defaultValue={product} className="input w-auto">
              <option value="">همه محصولات</option>
              {products.map(p => (
                <option key={p} value={p!}>{p}</option>
              ))}
            </select>
            <button className="btn-ghost text-sm">اعمال فیلتر</button>
          </form>
        </div>

        <div className="mt-6">
          <CohortTable cohorts={cohorts} period={period} />
        </div>
      </div>
    </>
  );
}