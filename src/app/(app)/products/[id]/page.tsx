import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { topBy } from "@/lib/analytics/kpi";
import { formatIRR, formatNum } from "@/lib/utils";
import { BackButton } from "@/components/app/BackButton";
import { AppNav } from "@/components/app/AppNav";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const upload = await db.upload.findFirst({ where: { id, userId: user.id } });
  if (!upload) notFound();
  const rows = await db.dataRow.findMany({ where: { uploadId: upload.id } });

  const perPage = 50;
  const allProducts = topBy(rows as any, "product", 100000);

  const q = (sp.q || "").trim();
  let products = allProducts;
  if (q) products = products.filter(p => p.name.includes(q));

  const sort = sp.sort || "amount";
  if (sort === "amount") products.sort((a, b) => b.amount - a.amount);
  else if (sort === "count") products.sort((a, b) => b.count - a.count);
  else if (sort === "name") products.sort((a, b) => a.name.localeCompare(b.name, "fa"));

  const page = Math.max(1, Number(sp.page) || 1);
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const pageItems = products.slice((safePage - 1) * perPage, safePage * perPage);

  function buildQuery(patch: Record<string, string | number | undefined>) {
    const qs = new URLSearchParams();
    const merged = { q, sort, page: safePage, ...patch };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== "") qs.set(k, String(v));
    });
    return `/products/${upload!.id}?${qs.toString()}`;
  }

  return (
    <>
      <AppNav current="dashboard" />
      <div className="container-tight py-10" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <BackButton href={`/dashboard/${upload.id}`} label="بازگشت به داشبورد" />
        </div>

        <h1 className="h2">محصولات</h1>

        <form className="mt-4 flex flex-wrap gap-2" action={`/products/${upload.id}`}>
          <input
            name="q"
            defaultValue={q}
            placeholder="جستجو نام محصول..."
            className="input flex-1 min-w-[200px]"
          />
          <select name="sort" defaultValue={sort} className="input w-auto">
            <option value="amount">بیشترین فروش</option>
            <option value="count">بیشترین تعداد</option>
            <option value="name">نام</option>
          </select>
          <button className="btn-ghost">اعمال فیلتر</button>
        </form>

        <div className="mt-3 text-sm text-slate-600">
          {formatNum(total)} محصول — صفحه {formatNum(safePage)} از {formatNum(totalPages)}
        </div>

        <div className="mt-4 card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs">
              <tr>
                <th className="px-3 py-3 text-right">محصول</th>
                <th className="px-3 py-3 text-right">فروش</th>
                <th className="px-3 py-3 text-right">تعداد سفارش</th>
                <th className="px-3 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(p => (
                <tr key={p.name} className="border-t border-slate-100">
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2">{formatIRR(p.amount)}</td>
                  <td className="px-3 py-2">{formatNum(p.count)}</td>
                  <td className="px-3 py-2 text-left">
                    <Link
                      href={`/products/${upload.id}/${encodeURIComponent(p.name)}`}
                      className="text-brand-600"
                    >
                      جزئیات
                    </Link>
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center muted">
                    داده‌ای یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {safePage > 1 && (
            <Link href={buildQuery({ page: safePage - 1 })} className="btn-ghost text-sm">
              صفحه قبل
            </Link>
          )}
          {safePage < totalPages && (
            <Link href={buildQuery({ page: safePage + 1 })} className="btn-ghost text-sm">
              صفحه بعد
            </Link>
          )}
        </div>
      </div>
    </>
  );
}