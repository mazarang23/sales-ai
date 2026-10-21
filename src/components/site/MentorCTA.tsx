import Link from "next/link";

export function MentorCTA() {
  return (
    <section className="py-16">
      <div className="container-tight">
        <div className="card p-8 md:p-10 bg-gradient-to-l from-brand-50 via-white to-emerald-50 border-brand-200">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h3 className="text-2xl font-bold">
                مشاور رشد هستی؟ درآمدت را با فروشیار بساز.
              </h3>
              <p className="muted mt-3 text-sm leading-7 max-w-2xl">
                پروفایلت را بساز، بعد از تایید در لیست مشاورین قرار بگیر،
                درخواست جلسه بگیر، و از هر جلسه ۸۰٪ مبلغ را دریافت کن.
                پلتفرم، جذب مشتری و مدیریت جلسات را برایت انجام می‌دهد.
              </p>
            </div>
            <Link href="/consultant/register" className="btn-primary px-6 py-3 whitespace-nowrap">
              ثبت‌نام مشاور
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}