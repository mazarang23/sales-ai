import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatNum, formatIRR, formatDate } from "@/lib/utils";
import { computeKpis, topBy } from "@/lib/analytics/kpi";
import { computeRfm } from "@/lib/analytics/rfm";

export const dynamic = "force-dynamic";

function formatBytes(n: number) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default async function AdminUploadDetail({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const upload = await db.upload.findUnique({
    where: { id },
    include: {
      user: { select: { phone: true, name: true, industry: true } },
      mappings: true
    }
  });
  if (!upload) notFound();

  const rows = await db.dataRow.findMany({ where: { uploadId: upload.id } });
  const kpis = computeKpis(rows as any);
  const topProducts = topBy(rows as any, "product", 5);
  const rfm = computeRfm(rows as any);
  const seg = rfm.reduce((acc, x) => {
    acc[x.segment] = (acc[x.segment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h2">{upload.fileName}</h1>
          <p className="muted mt-1 text-sm">
            آپلود شده توسط{" "}
            <span dir="ltr" className="font-mono">
              {upload.user ? upload.user.phone : "—"}
            </span>
            {upload.user?.name && ` (${upload.user.name})`}
            {" — "}
            {formatDate(upload.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/uploads" className="btn-ghost text-sm">
            بازگشت
          </Link>
          <a
            href={`/api/uploads/${upload.id}/download`}
            className="btn-primary text-sm"
          >
            دانلود فایل اصلی
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="حجم" value={formatBytes(upload.fileSize)} />
        <Stat label="ردیف" value={formatNum(upload.rowCount)} />
        <Stat label="شیت" value={formatNum(upload.sheetCount)} />
        <Stat label="صنف کاربر" value={upload.user?.industry || "—"} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="فروش کل" value={formatIRR(kpis.total)} />
        <Stat label="سفارش" value={formatNum(kpis.orders)} />
        <Stat label="مشتری یکتا" value={formatNum(kpis.customers)} />
        <Stat label="AOV" value={formatIRR(kpis.aov)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="font-bold mb-3">پرفروش‌ترین محصولات</div>
          {topProducts.length === 0 ? (
            <div className="muted text-sm">داده‌ای نیست</div>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">#{i + 1}</span>
                    <span className="truncate max-w-[200px]">{p.name}</span>
                  </div>
                  <span className="font-medium">{formatIRR(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="font-bold mb-3">بخش‌بندی مشتریان</div>
          {Object.keys(seg).length === 0 ? (
            <div className="muted text-sm">داده‌ای نیست</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(seg).map(([k, v]) => (
                <div key={k} className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">{k}</div>
                  <div className="text-lg font-bold">{formatNum(v)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="font-bold mb-3">نگاشت ستون‌ها</div>
        <pre
          className="text-xs bg-slate-50 p-3 rounded-xl overflow-auto"
          dir="ltr"
        >
          {JSON.stringify(upload.mappings?.fieldMap || {}, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}