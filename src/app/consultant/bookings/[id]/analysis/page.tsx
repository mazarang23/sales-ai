import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getBookingForConsultant, isSensitiveColumn } from "@/lib/consultant-access";
import { computeKpis, topBy } from "@/lib/analytics/kpi";
import { computeRfm } from "@/lib/analytics/rfm";
import { formatIRR, formatNum, formatDate } from "@/lib/utils";
import { SalesChart } from "@/components/charts/SalesChart";
import { BackButton } from "@/components/app/BackButton";

export const dynamic = "force-dynamic";

export default async function ConsultantAnalysisPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const access = await getBookingForConsultant(id);
  if (!access) {
    return (
      <div className="container-tight py-10 max-w-md" dir="rtl">
        <BackButton href={`/consultant/bookings/${id}`} label="بازگشت" />
        <h1 className="h2 mt-4">دسترسی ممکن نیست</h1>
        <p className="muted mt-3 text-sm">
          دسترسی به تحلیل فقط بعد از تایید پرداخت و برای همین مشاور ممکن است.
        </p>
      </div>
    );
  }

  const { booking } = access;

  // پیدا کردن آخرین آپلود کاربر
  const upload = await db.upload.findFirst({
    where: { userId: booking.userId },
    orderBy: { createdAt: "desc" }
  });

  if (!upload) {
    return (
      <div className="container-tight py-10 max-w-md" dir="rtl">
        <BackButton href={`/consultant/bookings/${id}`} label="بازگشت" />
        <h1 className="h2 mt-4">تحلیلی موجود نیست</h1>
        <p className="muted mt-3 text-sm">
          این کاربر هنوز فایلی آپلود نکرده است.
        </p>
      </div>
    );
  }

  const rows = await db.dataRow.findMany({ where: { uploadId: upload.id } });
  const kpis = computeKpis(rows as any);
  const topProducts = topBy(rows as any, "product", 8);
  const rfm = computeRfm(rows as any);
  const seg = rfm.reduce((acc, x) => {
    acc[x.segment] = (acc[x.segment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // فیلتر کردن ستون‌های حساس از raw
  const safeRows = rows.map(r => {
    const raw = (r.raw as any) || {};
    const safe: Record<string, any> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (!isSensitiveColumn(k)) safe[k] = v;
    }
    return { ...r, raw: safe };
  });

  return (
    <div className="container-tight py-10 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <BackButton href={`/consultant/bookings/${id}`} label="بازگشت به جلسه" />
        <span className="text-xs text-slate-500">
          جلسه {booking.hours} ساعته — پرداخت‌شده
        </span>
      </div>

      <div>
        <h1 className="h2">تحلیل فروشگاه</h1>
        <p className="muted mt-1 text-sm">
          {upload.fileName} — {formatNum(upload.rowCount)} ردیف — {formatDate(upload.createdAt)}
        </p>
        <div className="mt-3 rounded-xl bg-amber-50 text-amber-800 p-3 text-xs">
          ⚠️ اطلاعات تماس مشتریان (نام مشتری، تلفن، ایمیل، آدرس) برای حفظ حریم خصوصی نمایش داده نمی‌شود.
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="فروش کل" value={formatIRR(kpis.total)} />
        <Kpi label="تعداد سفارش" value={formatNum(kpis.orders)} />
        <Kpi label="مشتری یکتا" value={formatNum(kpis.customers)} />
        <Kpi label="میانگین سبد" value={formatIRR(kpis.aov)} />
      </div>

      <div className="card p-6">
        <div className="font-bold mb-4">روند فروش</div>
        <SalesChart
          rows={rows.map(r => ({
            date: r.date ? r.date.toISOString() : null,
            amount: r.amount ?? 0
          }))}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="font-bold mb-4">پرفروش‌ترین محصولات</div>
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">#{i + 1}</span>
                  <span className="text-sm truncate max-w-[180px]">{p.name}</span>
                </div>
                <span className="text-sm font-medium">{formatIRR(p.amount)}</span>
              </div>
            ))}
            {topProducts.length === 0 && <div className="muted text-sm">داده محصول موجود نیست</div>}
          </div>
        </div>

        <div className="card p-6">
          <div className="font-bold mb-4">بخش‌بندی مشتریان (RFM)</div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(seg).map(([k, v]) => (
              <div key={k} className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500">{k}</div>
                <div className="text-lg font-bold">{formatNum(v)}</div>
              </div>
            ))}
            {Object.keys(seg).length === 0 && (
              <div className="muted text-sm col-span-2">داده مشتری موجود نیست</div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="font-bold mb-3">نمونه داده (بدون اطلاعات تماس)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-2 py-2 text-right">محصول</th>
                <th className="px-2 py-2 text-right">مبلغ</th>
                <th className="px-2 py-2 text-right">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {safeRows.slice(0, 20).map(r => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-2 py-2 truncate max-w-[200px]">
                    {r.product || "—"}
                  </td>
                  <td className="px-2 py-2">{formatIRR(r.amount)}</td>
                  <td className="px-2 py-2">{formatDate(r.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}