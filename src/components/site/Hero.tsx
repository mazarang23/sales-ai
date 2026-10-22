import Link from "next/link";
import { HeroVisual } from "./HeroVisual";

export function Hero({
  title,
  subtitle,
  cta
}: {
  title?: string;
  subtitle?: string;
  cta?: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-white to-white" />
      <div className="absolute -top-32 -right-32 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="absolute -bottom-40 -left-32 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-purple-200/40 blur-3xl" />

      <div className="container-tight grid gap-8 sm:gap-10 py-12 sm:py-20 md:py-28 md:grid-cols-2 md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-[11px] sm:text-xs text-brand-700 shadow-soft">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-600" />
            تحلیل داده + مشاوره تخصصی، در یک پلتفرم
          </div>
          <h1 className="h1 mt-4 sm:mt-5 leading-[1.2]">
            {title || "از فایل فروش تا شناخت مشتری و تصمیم بعدی"}
          </h1>
          <p className="muted mt-4 sm:mt-5 text-base sm:text-lg leading-7 sm:leading-8">
            {subtitle ||
              "فایل فروش خود را تحلیل کن، الگوی خرید مشتریان را بشناس و برای قدم بعدی کسب‌وکارت تصمیم دقیق‌تری بگیر؛ در صورت نیاز، از مشاوران رشد هم کمک بگیر."}
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Link href="/register" className="btn-primary px-5 sm:px-6 py-3 text-sm sm:text-base text-center">
              {cta || "شروع تحلیل"}
            </Link>
            <Link href="/consultants" className="btn-ghost px-5 sm:px-6 py-3 text-sm sm:text-base text-center">
              مشاهده مشاورین
            </Link>
          </div>
          <div className="mt-6 sm:mt-8 flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600 flex-wrap">
            <div><span className="font-bold text-slate-900">RFM</span> شناخت مشتریان</div>
            <div><span className="font-bold text-slate-900">Cohort</span> بررسی بازگشت</div>
            <div><span className="font-bold text-slate-900">فارسی</span> تجربه بومی</div>
          </div>
        </div>
        <div className="md:justify-self-end w-full max-w-md">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}