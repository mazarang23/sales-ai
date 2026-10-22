import Link from "next/link";

export function TwoPaths() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container-tight">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <h2 className="h2">دو مسیر، یک هدف: رشد فروشگاه</h2>
          <p className="muted mt-3 text-sm sm:text-base">
            صاحب فروشگاه هستی یا مشاور رشد؟ مسیر خودت را انتخاب کن.
          </p>
        </div>
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
          <div className="card p-5 sm:p-7 flex flex-col">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-brand-50 text-brand-700 grid place-items-center text-xl sm:text-2xl">
              📊
            </div>
            <div className="mt-3 sm:mt-4 font-bold text-lg sm:text-xl">صاحب فروشگاه هستم</div>
            <p className="muted mt-2 sm:mt-3 text-sm leading-6 sm:leading-7 flex-1">
              فایل اکسل فروش را آپلود می‌کنم، تحلیل مشتریان، محصولات و فروش را
              می‌گیرم، و از موتور هوش مصنوعی فروشیار یا از مشاورین خبره،
              برنامه رشد می‌گیرم.
            </p>
            <Link href="/register" className="btn-primary mt-4 sm:mt-6">
              شروع تحلیل رایگان
            </Link>
          </div>

          <div className="card p-5 sm:p-7 flex flex-col ring-2 ring-brand-500/20">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center text-xl sm:text-2xl">
              🤝
            </div>
            <div className="mt-3 sm:mt-4 font-bold text-lg sm:text-xl">مشاور رشد هستم</div>
            <p className="muted mt-2 sm:mt-3 text-sm leading-6 sm:leading-7 flex-1">
              در حوزه فروش و رشد تخصص دارم. می‌خواهم به فروشگاه‌ها مشاوره بدهم،
              جلسه برگزار کنم، و از هر جلسه درآمد کسب کنم (۸۰٪ مبلغ برای من).
            </p>
            <Link href="/consultant/register" className="btn-primary mt-4 sm:mt-6">
              ثبت‌نام مشاور
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}