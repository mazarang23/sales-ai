import Link from "next/link";
import { db } from "@/lib/db";
import { formatNum, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatBytes(n: number) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default async function AdminUploads() {
  const uploads = await db.upload.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      user: { select: { phone: true, name: true } }
    }
  });

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="h2">آپلودها</h1>
        <p className="muted mt-1 text-sm">همه‌ی فایل‌هایی که کاربران آپلود کرده‌اند</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs">
            <tr>
              <th className="px-3 py-3 text-right">کاربر</th>
              <th className="px-3 py-3 text-right">نام فایل</th>
              <th className="px-3 py-3 text-right">حجم</th>
              <th className="px-3 py-3 text-right">ردیف</th>
              <th className="px-3 py-3 text-right">شیت</th>
              <th className="px-3 py-3 text-right">تاریخ</th>
              <th className="px-3 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {uploads.map(u => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  <div className="font-mono text-xs" dir="ltr">
                    {u.user ? u.user.phone : "—"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {u.user?.name || "—"}
                  </div>
                </td>
                <td className="px-3 py-2 max-w-[200px] truncate">{u.fileName}</td>
                <td className="px-3 py-2">{formatBytes(u.fileSize)}</td>
                <td className="px-3 py-2">{formatNum(u.rowCount)}</td>
                <td className="px-3 py-2">{formatNum(u.sheetCount)}</td>
                <td className="px-3 py-2">{formatDate(u.createdAt)}</td>
                <td className="px-3 py-2 text-left">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/admin/uploads/${u.id}`} className="text-brand-600 text-xs">
                      جزئیات
                    </Link>
                    <a href={`/api/uploads/${u.id}/download`} className="text-slate-600 text-xs">
                      دانلود
                    </a>
                  </div>
                </td>
              </tr>
            ))}
            {uploads.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center muted">
                  هنوز آپلودی نیست
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}