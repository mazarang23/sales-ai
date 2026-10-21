import Link from "next/link";

export function DemoPreview() {
  return (
    <section id="demo" className="py-20">
      <div className="container-tight grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="h2">دمو را ببین، بعد تصمیم بگیر</h2>
          <p className="muted mt-4 leading-7">
            با یک نمونه‌ی واقعی از داشبورد، بدون ثبت‌نام آشنا شو.
            اگر به کارت آمد، شماره‌ات را بده و فایل خودت را آپلود کن.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/demo" className="btn-primary px-5 py-3">
              مشاهده دموی کامل
            </Link>
            <Link href="/register" className="btn-ghost px-5 py-3">
              شروع تحلیل رایگان
            </Link>
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="bg-slate-900 px-4 py-2 text-xs text-slate-300">preview.dashboard</div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500">روند فروش</div>
                <div className="mt-2 h-20 rounded-lg bg-gradient-to-tr from-brand-200 to-purple-200" />
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500">پرفروش‌ها</div>
                <div className="mt-2 space-y-1.5">
                  <div className="h-2 rounded bg-brand-300 w-4/5" />
                  <div className="h-2 rounded bg-brand-300 w-3/5" />
                  <div className="h-2 rounded bg-brand-300 w-2/5" />
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
              پیشنهاد AI: بازگرداندن ۲۰ مشتری قدیمی می‌تواند حدود ۲۴ میلیون تومان به فروش اضافه کند.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}