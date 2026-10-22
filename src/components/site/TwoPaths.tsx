import Link from "next/link";

export function TwoPaths() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container-tight">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="h2">فروشیار دقیقاً چه کاری برای شما انجام می‌دهد؟</h2>
          <p className="muted mt-3 text-sm sm:text-base leading-7">
            از اولین سؤال مشتری تا پیگیری و فروش، یک مسیر یکپارچه برای تیم فروش شما می‌سازیم.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          <div className="card p-5 sm:p-7 flex flex-col">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-brand-50 text-brand-700 grid place-items-center text-xl sm:text-2xl">💬</div>
            <div className="mt-3 sm:mt-4 font-bold text-lg">پاسخ‌گویی هوشمند</div>
            <p className="muted mt-2 text-sm leading-6 sm:leading-7">به سؤال مشتری درباره محصول، قیمت و انتخاب مناسب، سریع و بر اساس اطلاعات کسب‌وکار شما پاسخ می‌دهد.</p>
          </div>

          <div className="card p-5 sm:p-7 flex flex-col">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center text-xl sm:text-2xl">🎯</div>
            <div className="mt-3 sm:mt-4 font-bold text-lg">شناسایی مشتری آماده خرید</div>
            <p className="muted mt-2 text-sm leading-6 sm:leading-7">مکالمات مهم را از دست نمی‌دهد و مشتریان جدی را از پرسش‌های معمولی جدا می‌کند.</p>
          </div>

          <div className="card p-5 sm:p-7 flex flex-col ring-2 ring-brand-500/20">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-700 grid place-items-center text-xl sm:text-2xl">🔁</div>
            <div className="mt-3 sm:mt-4 font-bold text-lg">پیگیری تا فروش</div>
            <p className="muted mt-2 text-sm leading-6 sm:leading-7">سرنخ را رها نمی‌کند؛ وضعیت مشتری را نگه می‌دارد و قدم بعدی فروش را به شما یادآوری می‌کند.</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/demo" className="btn-ghost">یک مکالمه واقعی را ببینید</Link>
        </div>
      </div>
    </section>
  );
}
