import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-black">A</div>
            <div>
              <div className="font-black leading-tight">پنل ادمین</div>
              <div className="text-xs text-slate-500">فروشیار AI</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-slate-500 font-mono" dir="ltr">{user.phone}</span>
            <Link href="/" className="btn-ghost text-sm">مشاهده سایت</Link>
            <form action="/api/auth/logout" method="post">
              <button className="btn-ghost text-sm text-red-600">خروج</button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <aside className="card p-3 h-fit">
            <nav className="space-y-1 text-sm">
              <NavItem href="/admin" label="داشبورد" />
              <NavItem href="/admin/content" label="مدیریت محتوا" />
              <NavItem href="/admin/blog" label="مقالات" />
              <NavItem href="/admin/uploads" label="آپلودها" />
              <NavItem href="/admin/plans" label="پلن‌ها" />
              <NavItem href="/admin/consultants" label="مشاورین" />
              <NavItem href="/admin/bookings" label="تراکنش‌ها" />
              <NavItem href="/admin/tickets" label="تیکت‌ها" />
              <NavItem href="/admin/leads" label="لیدها" />
              <NavItem href="/admin/users" label="کاربران" />
            </nav>
          </aside>
          <section>{children}</section>
        </div>
      </div>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition">
      {label}
    </Link>
  );
}