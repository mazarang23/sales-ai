import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatNum, formatDate } from "@/lib/utils";
import { AppNav } from "@/components/app/AppNav";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const uploads = await db.upload.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return (
    <>
      <AppNav current="dashboard" />
      <div className="container-tight py-10" dir="rtl">
        {uploads.length === 0 ? (
          <>
            <h1 className="h2">سلام {user.name || user.phone}</h1>
            <p className="muted mt-2">هنوز فایلی آپلود نکردی.</p>
            <div className="mt-6 flex gap-2 flex-wrap">
              <Link href="/upload" className="btn-primary">آپلود فایل فروش</Link>
              <Link href="/bookings" className="btn-ghost">جلسات من</Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="h2">داشبورد</h1>
                <p className="muted mt-1 text-sm">آپلودهای اخیر تو</p>
              </div>
              <Link href="/upload" className="btn-primary text-sm">آپلود جدید</Link>
            </div>

            <div className="mt-6 space-y-2">
              {uploads.map(u => (
                <div key={u.id} className="card p-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="font-medium truncate max-w-[300px]">{u.fileName}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatDate(u.createdAt)} — {formatNum(u.rowCount)} ردیف
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link href={`/mapping/${u.id}`} className="btn-ghost text-xs">
                      ستون‌ها
                    </Link>
                    <Link href={`/dashboard/${u.id}`} className="btn-primary text-xs">
                      تحلیل
                    </Link>
                    <Link href="/consultants" className="btn-ghost text-xs text-emerald-700 border-emerald-300">
                      رزرو مشاور
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
