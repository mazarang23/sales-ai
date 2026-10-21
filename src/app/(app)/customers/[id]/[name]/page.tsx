import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatIRR, formatNum, formatDate } from "@/lib/utils";
import { computeRfm } from "@/lib/analytics/rfm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CustomerDetail({
  params,
  searchParams
}: {
  params: { id: string; name: string };
  searchParams: { page?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const upload = await db.upload.findFirst({ where: { id: params.id, userId: user.id } });
  if (!upload) notFound();
  const name = decodeURIComponent(params.name);

  const allRows = await db.dataRow.findMany({
    where: { uploadId: upload.id, customer: name }
  });
  if (allRows.length === 0) notFound();

  const rfm = computeRfm(allRows as any)[0];

  const products = new Map<string, { amount: number; count: number }>();
  for (const r of allRows) {
    if (!r.product) continue;
    const c = products.get(r.product) ?? { amount: 0, count: 0 };
    c.amount += r.amount ?? 0;
    c.count += 1;
    products.set(r.product, c);
  }
  const topProducts = [...products.entries()]
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 10);

  const perPage = 50;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const total = allRows.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const pageItems = allRows.slice((safePage - 1) * perPage, safePage * perPage);

  return (
    <div className="container-tight py-10 max-w-3xl" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="h2">{name}</h1>
        <Link href={`/customers/${upload.id}`} className="btn-ghost text-sm">
          بازگشت
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Kpi label="مجموع خرید" value={formatIRR(rfm.sum)} />
        <Kpi label="تعداد خرید" value={formatNum(rfm.count)} />
        <Kpi label="روز از آخرین" value={formatNum(rfm.recency)} />
        <Kpi label="سگمنت" value={rfm.segment} />
      </div>

      <div className="card mt-6 p-6">
        <div className="font-bold mb-3">محصولات پرتکرار</div>
        {topProducts.length === 0 ? (
          <div className="muted text-sm">داده‌ای نیست</div>
        ) : (
          <div className="space-y-2">
            {topProducts.map(([p, v]) => (
              <div key={p} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                <span>{p}</span>
                <span>
                  {formatIRR(v.amount)} ({formatNum(v.count)} خرید)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card mt-6 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold">تاریخچه خرید</div>
          <div className="text-sm text-slate-500">
            {formatNum(total)} خرید — صفحه {formatNum(safePage)} از {formatNum(totalPages)}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-2 py-2 text-right">تاریخ</th>
                <th className="px-2 py-2 text-right">محصول</th>
                <th className="px-2 py-2 text-right">مبلغ</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(r => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-2 py-2">{formatDate(r.date)}</td>
                  <td className="px-2 py-2">{r.product || "—"}</td>
                  <td className="px-2 py-2">{formatIRR(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
          {safePage > 1 && (
            <Link
              href={`/customers/${upload.id}/${encodeURIComponent(name)}?page=${safePage - 1}`}
              className="btn-ghost text-sm"
            >
              صفحه قبل
            </Link>
          )}
          {safePage < totalPages && (
            <Link
              href={`/customers/${upload.id}/${encodeURIComponent(name)}?page=${safePage + 1}`}
              className="btn-ghost text-sm"
            >
              صفحه بعد
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}