import { db } from "@/lib/db";
import { computeRfm } from "@/lib/analytics/rfm";
import { formatNum } from "@/lib/utils";
import Link from "next/link";

export async function DashboardRfmLoader({ uploadId }: { uploadId: string }) {
  const rows = await db.dataRow.findMany({ where: { uploadId } });
  const rfm = computeRfm(rows as any);
  const seg = rfm.reduce((acc, x) => {
    acc[x.segment] = (acc[x.segment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="card p-6">
      <div className="font-bold mb-4">بخش‌بندی مشتریان (RFM)</div>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(seg).map(([k, v]) => (
          <Link
            key={k}
            href={`/customers/${uploadId}?segment=${encodeURIComponent(k)}`}
            className="rounded-xl bg-slate-50 p-3 hover:bg-slate-100 transition"
          >
            <div className="text-xs text-slate-500">{k}</div>
            <div className="text-lg font-bold">{formatNum(v)}</div>
          </Link>
        ))}
        {Object.keys(seg).length === 0 && (
          <div className="muted text-sm col-span-2">داده مشتری موجود نیست</div>
        )}
      </div>
    </div>
  );
}