import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatIRR, formatNum, formatDate } from "@/lib/utils";
import { AppNav } from "@/components/app/AppNav";
import { PlanStatusCard } from "@/components/app/PlanStatusCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PLAN_LABELS: Record<string, string> = {
  free: "رایگان",
  pro: "رشد",
  business: "حرفه‌ای"
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [subscriptions, bookings, uploads, consultant] = await Promise.all([
    db.subscription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    db.booking.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { consultant: { select: { displayName: true } } }
    }),
    db.upload.count({ where: { userId: user.id } }),
    db.consultant.findUnique({ where: { userId: user.id } })
  ]);

  return (
    <>
      <AppNav current="account" />
      <div className="container-tight py-10 space-y-6" dir="rtl">
        <div>
          <h1 className="h2">حساب من</h1>
          <p className="muted mt-1 text-sm">{user.name || user.phone}</p>
        </div>

        {/* کارت وضعیت پلن */}
        <PlanStatusCard
          plan={user.plan}
          planExpiresAt={user.planExpiresAt}
          aiQuestionsUsed={user.aiQuestionsUsed}
          aiQuestionsLimit={user.aiQuestionsLimit}
          walletBalance={user.walletBalance}
        />

        {/* آمار کلی */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <div className="text-xs text-slate-500">آپلودها</div>
            <div className="mt-1 text-xl font-bold">{formatNum(uploads)}</div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-slate-500">جلسات</div>
            <div className="mt-1 text-xl font-bold">{formatNum(bookings.length)}</div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-slate-500">تراکنش‌های اشتراک</div>
            <div className="mt-1 text-xl font-bold">{formatNum(subscriptions.length)}</div>
          </div>
        </div>

        {/* دسترسی سریع */}
        <div className="card p-6">
          <div className="font-bold mb-3">دسترسی سریع</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/dashboard" className="rounded-xl bg-slate-50 p-4 hover:bg-slate-100 transition">
              <div className="font-medium">داشبورد تحلیل</div>
              <div className="text-xs text-slate-500 mt-1">
                تحلیل آپلودها، کوهورت، مشتریان، محصولات
              </div>
            </Link>
            <Link href="/bookings" className="rounded-xl bg-slate-50 p-4 hover:bg-slate-100 transition">
              <div className="font-medium">جلسات من</div>
              <div className="text-xs text-slate-500 mt-1">
                رزروهای مشاوره، چت، امتیازدهی
              </div>
            </Link>
            <Link href="/consultants" className="rounded-xl bg-slate-50 p-4 hover:bg-slate-100 transition">
              <div className="font-medium">رزرو مشاور جدید</div>
              <div className="text-xs text-slate-500 mt-1">
                از بین مشاورین تاییدشده انتخاب کن
              </div>
            </Link>
            {consultant ? (
              <Link href="/consultant/dashboard" className="rounded-xl bg-emerald-50 p-4 hover:bg-emerald-100 transition">
                <div className="font-medium text-emerald-800">پنل مشاور</div>
                <div className="text-xs text-emerald-700 mt-1">
                  {consultant.status === "approved"
                    ? "پروفایل تاییدشده"
                    : consultant.status === "rejected"
                    ? "رد شده"
                    : "در انتظار تایید"}
                </div>
              </Link>
            ) : (
              <Link href="/consultant/register" className="rounded-xl bg-slate-50 p-4 hover:bg-slate-100 transition">
                <div className="font-medium">مشاور شو</div>
                <div className="text-xs text-slate-500 mt-1">
                  پروفایل مشاور بساز و درآمد کسب کن
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* آخرین تراکنش‌ها */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold">آخرین تراکنش‌های اشتراک</div>
            <Link href="/account/subscriptions" className="text-sm text-brand-600">
              همه تراکنش‌ها
            </Link>
          </div>
          {subscriptions.length === 0 ? (
            <div className="muted text-sm">هنوز تراکنشی ثبت نشده.</div>
          ) : (
            <div className="space-y-2">
              {subscriptions.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <div>
                    <div className="font-medium">{PLAN_LABELS[s.plan] || s.plan}</div>
                    <div className="text-xs text-slate-500">{formatDate(s.createdAt)}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{formatIRR(s.amount)}</div>
                    <span
                      className={`inline-block mt-1 rounded px-2 py-0.5 text-xs ${
                        s.status === "paid"
                          ? "bg-emerald-50 text-emerald-700"
                          : s.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {s.status === "paid"
                        ? "پرداخت شده"
                        : s.status === "pending"
                        ? "در انتظار"
                        : "ناموفق"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* آخرین جلسات */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold">آخرین جلسات</div>
            <Link href="/bookings" className="text-sm text-brand-600">همه جلسات</Link>
          </div>
          {bookings.length === 0 ? (
            <div className="muted text-sm">هنوز جلسه‌ای نداری.</div>
          ) : (
            <div className="space-y-2">
              {bookings.map(b => (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 transition"
                >
                  <div>
                    <div className="font-medium">{b.consultant.displayName}</div>
                    <div className="text-xs text-slate-500">
                      {formatDate(b.createdAt)} — {formatIRR(b.amount)}
                    </div>
                  </div>
                  <span className="text-xs text-brand-600">مشاهده</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}