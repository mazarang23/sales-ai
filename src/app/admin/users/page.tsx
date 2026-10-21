import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatNum, formatDate } from "@/lib/utils";
import { RoleToggle } from "@/components/admin/RoleToggle";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const current = await getCurrentUser();
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { _count: { select: { uploads: true } } }
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="h2">کاربران</h1>
        <p className="muted mt-1 text-sm">
          از اینجا می‌توانی نقش هر کاربر را تغییر بدهی.
        </p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs">
            <tr>
              <th className="px-3 py-3 text-right">شماره</th>
              <th className="px-3 py-3 text-right">نام</th>
              <th className="px-3 py-3 text-right">صنف</th>
              <th className="px-3 py-3 text-right">نقش</th>
              <th className="px-3 py-3 text-right">آپلودها</th>
              <th className="px-3 py-3 text-right">عضویت</th>
              <th className="px-3 py-3 text-right">تغییر نقش</th>
              <th className="px-3 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                  {u.phone}
                </td>
                <td className="px-3 py-2">{u.name || "—"}</td>
                <td className="px-3 py-2">{u.industry || "—"}</td>
                <td className="px-3 py-2">
                  {u.role === "ADMIN" ? (
                    <span className="rounded bg-slate-900 text-white px-2 py-0.5 text-xs">
                      ادمین
                    </span>
                  ) : (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">کاربر</span>
                  )}
                </td>
                <td className="px-3 py-2">{formatNum(u._count.uploads)}</td>
                <td className="px-3 py-2 text-xs">{formatDate(u.createdAt)}</td>
                <td className="px-3 py-2">
                  <RoleToggle
                    userId={u.id}
                    currentRole={u.role}
                    isSelf={current?.id === u.id}
                  />
                </td>
                <td className="px-3 py-2 text-left">
                  <Link href={`/admin/users/${u.id}`} className="text-brand-600 text-xs">
                    جزئیات
                  </Link>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center muted">
                  کاربری نیست
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}