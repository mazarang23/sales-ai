import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function AppNav({ current }: { current?: string }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const consultant = await db.consultant.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true }
  });

  const items: { href: string; label: string; key: string }[] = [
    { href: "/dashboard", label: "داشبورد", key: "dashboard" },
    { href: "/bookings", label: "جلسات", key: "bookings" },
    { href: "/account", label: "حساب من", key: "account" },
    { href: "/upload", label: "آپلود جدید", key: "upload" }
  ];

  return (
    <div className="relative z-30 border-b border-slate-200 bg-white">
      <div className="container-tight flex gap-1 overflow-x-auto py-2 text-sm">
        {items.map(it => (
          <Link
            key={it.key}
            href={it.href}
            className={`rounded-lg px-3 py-1.5 whitespace-nowrap transition ${
              current === it.key
                ? "bg-brand-50 text-brand-700 font-medium"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {it.label}
          </Link>
        ))}
        {consultant && (
          <Link
            href="/consultant/dashboard"
            className="rounded-lg px-3 py-1.5 whitespace-nowrap text-emerald-700 hover:bg-emerald-50"
          >
            پنل مشاور
          </Link>
        )}
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="rounded-lg px-3 py-1.5 whitespace-nowrap text-brand-700 hover:bg-brand-50"
          >
            پنل ادمین
          </Link>
        )}
      </div>
    </div>
  );
}
