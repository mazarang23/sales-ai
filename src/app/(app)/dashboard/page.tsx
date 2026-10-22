import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatNum, formatDate } from "@/lib/utils";
import { AppNav } from "@/components/app/AppNav";
import Link from "next/link";

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
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">شروع فروشیار</div>
            <h1 className="h2 mt-4">سلام {user.name || user.phone}</h1>
            <p className="muted mt-2 leading-7">
              هنوز داده‌ای وارد نکرده‌ای. برای اینکه فروشیار بتواند مشتری، محصول و فرصت‌های رشد را تحلیل کند، اولین فایل فروش خودت را وارد کن.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="card p-4"><div className="text-xl">📥</div><div className="mt-2 font-bold">ورود داده</div><div className="muted mt-1 text-xs">فایل فروش را وارد کن.</div></div>
              <div className="card p-4"><div className="text-xl">🎯</div><div className="mt-2 font-bold">شناخت مشتری</div><div className="muted mt-1 text-xs">مشتریان ارزشمند را پیدا کن.</div></div>
              <div className="card p-4"><div className="text-xl">🤖</div><div className="mt-2 font-bold">اقدام بعدی</div><div className="muted mt-1 text-xs">از دستیار هوشمند پیشنهاد بگیر.</div></div>
            </div>
            <div className="mt-6 flex gap-2 flex-wrap">
              <Link href="/upload" className="btn-primary">شروع رایگان</Link>
              <Link href="/demo" className="btn-ghost">دیدن نمونه</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">مرکز هوش فروش</div>
                <h1 className="h2 mt-3">داشبورد فروشیار</h1>
                <p className="muted mt-1 text-sm">از داده فروش تا شناخت مشتری و تصمیم بعدی.</p>
              </div>
              <Link href="/upload" className="btn-primary text-sm">افزودن داده فروش</Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card p-5"><div className="text-xs text-slate-500">فایل‌های فروش</div><div className="mt-2 text-2xl font-black">{formatNum(uploads.length)}</div></div>
              <div className="card p-5"><div className="text-xs text-slate-500">آخرین ورود داده</div><div className="mt-2 font-bold">{formatDate(uploads[0].createdAt)}</div></div>
              <div className="card p-5"><div className="text-xs text-slate-500">مرحله فعلی</div><div className="mt-2 font-bold">تحلیل و اقدام</div></div>
              <div className="card p-5"><div className="text-xs text-slate-500">اقدام پیشنهادی</div><div className="mt-2 font-bold">بررسی مشتریان</div></div>
            </div>

            <div className="mt-8 card p-6">
              <div className="font-bold">مسیر رشد فروش</div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                {[
                  ["۱", "داده فروش", "اطلاعات واقعی کسب‌وکارت را وارد کن."],
                  ["۲", "شناخت مشتری", "مشتریان مهم و در معرض ریزش را پیدا کن."],
                  ["۳", "پیشنهاد اقدام", "فروشیار قدم بعدی را پیشنهاد می‌دهد."],
                  ["۴", "پیگیری فروش", "نتیجه اقدامات را اندازه‌گیری و تکرار کن."]
                ].map(([number, title, text]) => (
                  <div key={number} className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs text-brand-600">مرحله {number}</div>
                    <div className="mt-2 font-bold">{title}</div>
                    <div className="muted mt-1 text-xs leading-5">{text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold">داده‌های اخیر</div>
                  <div className="muted mt-1 text-xs">یک فایل را انتخاب کن تا وارد لایه تحلیل و دستیار هوشمند شوی.</div>
                </div>
                <Link href="/customers" className="text-sm text-brand-600">مشتریان</Link>
              </div>
              <div className="mt-4 space-y-2">
                {uploads.map(u => (
                  <div key={u.id} className="card p-4 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="font-medium truncate max-w-[300px]">{u.fileName}</div>
                      <div className="text-xs text-slate-500 mt-1">{formatDate(u.createdAt)} — {formatNum(u.rowCount)} ردیف</div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Link href={`/customers/${u.id}`} className="btn-ghost text-xs">مشتریان</Link>
                      <Link href={`/dashboard/${u.id}`} className="btn-primary text-xs">مشاهده هوش فروش</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
