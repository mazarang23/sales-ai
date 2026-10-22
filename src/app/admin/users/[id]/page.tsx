import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatNum, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUserDetail({ params }: { params: { id: string } }) {
  const user = await db.user.findUnique({
    where: { id: params.id },
    include: {
      uploads: { orderBy: { createdAt: "desc" }, take: 50 },
      _count: { select: { uploads: true } }
    }
  });
  if (!user) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h2">{user.name || user.phone}</h1>
          <p className="muted mt-1 text-sm font-mono" dir="ltr">
            {user.phone}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users" className="btn-ghost text-sm">
            بازگشت
          </Link>
          <Link
            href={`/admin/users/${user.id}/login`}
            className="btn-primary text-sm"
          >
            ورود به پنل کاربر
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="صنف" value={user.industry || "—"} />
        <Stat label="نقش" value={user.role === "ADMIN" ? "ادمین" : "کاربر"} />
        <Stat label="تعداد آپلود" value={formatNum(user._count.uploads)} />
        <Stat label="پلن فعلی" value={planLabel(user.plan)} />
        <Stat label="اعتبار پلن" value={expiryLabel(user.planExpiresAt)} />
        <Stat
          label="آخرین فعالیت"
          value={user.lastSeenAt ? formatDate(user.lastSeenAt) : "—"}
        />
      </div>

      <div className="card p-5">
        <div className="font-bold mb-3">آپلودهای این کاربر</div>
        {user.uploads.length === 0 ? (
          <div className="muted text-sm">آپلودی ندارد</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs">
                <tr>
                  <th className="px-3 py-2 text-right">نام فایل</th>
                  <th className="px-3 py-2 text-right">ردیف</th>
                  <th className="px-3 py-2 text-right">تاریخ</th>
                  <th className="px-3 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {user.uploads.map(u => (
                  <tr key={u.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 truncate max-w-[200px]">{u.fileName}</td>
                    <td className="px-3 py-2">{formatNum(u.rowCount)}</td>
                    <td className="px-3 py-2 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-3 py-2 text-left">
                      <Link
                        href={`/admin/uploads/${u.id}`}
                        className="text-brand-600 text-xs"
                      >
                        جزئیات
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
function planLabel(plan: string) { return ({ free: "رایگان", pro: "رشد", business: "حرفه‌ای" } as Record<string, string>)[plan] || plan; }
function expiryLabel(date: Date | null) { if (!date) return "بدون تاریخ انقضا"; const days = Math.ceil((date.getTime() - Date.now()) / 86400000); return days <= 0 ? "منقضی شده" : String(days) + " روز باقی‌مانده"; }
