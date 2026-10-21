import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatIRR, formatNum } from "@/lib/utils";
import { BackButton } from "@/components/app/BackButton";
import { AppNav } from "@/components/app/AppNav";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProductDetail({
  params
}: {
  params: Promise<{ id: string; name: string }>;
}) {
  const { id, name: rawName } = await params;
  const name = decodeURIComponent(rawName);

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const upload = await db.upload.findFirst({ where: { id, userId: user.id } });
  if (!upload) notFound();

  const rows = await db.dataRow.findMany({
    where: { uploadId: upload.id, product: name }
  });
  if (rows.length === 0) notFound();

  const total = rows.reduce((s, r) => s + (r.amount ?? 0), 0);
  const buyers = new Map<string, { amount: number; count: number }>();
  for (const r of rows) {
    if (!r.customer) continue;
    const c = buyers.get(r.customer) ?? { amount: 0, count: 0 };
    c.amount += r.amount ?? 0;
    c.count += 1;
    buyers.set(r.customer, c);
  }
  const topBuyers = [...buyers.entries()]
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 20);

  return (
    <>
      <AppNav current="dashboard" />
      <div className="container-tight py-10 max-w-3xl" dir="rtl">
        <BackButton href={`/products/${upload.id}`} label="بازگشت به محصولات" />

        <h1 className="h2 mt-4">{name}</h1>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Kpi label="فروش کل" value={formatIRR(total)} />
          <Kpi label="تعداد سفارش" value={formatNum(rows.length)} />
          <Kpi label="خریدار یکتا" value={formatNum(buyers.size)} />
        </div>

        <div className="card mt-6 p-6">
          <div className="font-bold mb-3">خریداران اصلی</div>
          {topBuyers.length === 0 ? (
            <div className="muted text-sm">داده‌ای نیست</div>
          ) : (
            <div className="space-y-2">
              {topBuyers.map(([c, v]) => (
                <div
                  key={c}
                  className="flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                >
                  <Link
                    href={`/customers/${upload.id}/${encodeURIComponent(c)}`}
                    className="text-brand-600"
                  >
                    {c}
                  </Link>
                  <span>
                    {formatIRR(v.amount)} ({formatNum(v.count)} خرید)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
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