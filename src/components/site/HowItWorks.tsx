const buyerSteps = [
  {
    n: "۱",
    t: "اکسل را آپلود کن",
    d: "هر ساختاری، هر شیتی. ستون‌ها را خودکار تشخیص می‌دهیم."
  },
  {
    n: "۲",
    t: "تحلیل بگیر",
    d: "داشبورد مشتریان، محصولات، فروش و RFM."
  },
  {
    n: "۳",
    t: "با AI یا مشاور پیش برو",
    d: "برنامه رشد AI بگیر، یا با یک مشاور خبره جلسه بگذار."
  }
];

const mentorSteps = [
  {
    n: "۱",
    t: "پروفایل بساز",
    d: "تخصص، تعرفه، و لینک‌های حرفه‌ای‌ات را وارد کن."
  },
  {
    n: "۲",
    t: "تایید شو",
    d: "بعد از تایید ادمین، در لیست مشاورین نمایش داده می‌شوی."
  },
  {
    n: "۳",
    t: "جلسه بده و درآمد بساز",
    d: "درخواست‌ها را بپذیر، جلسه برگزار کن، و ۸۰٪ مبلغ را دریافت کن."
  }
];

export function HowItWorks() {
  return (
    <section id="how" className="py-20">
      <div className="container-tight">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="h2">چطور کار می‌کند</h2>
          <p className="muted mt-3">
            در سه گام، چه صاحب فروشگاه باشی، چه مشاور رشد.
          </p>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700 font-medium">
              صاحب فروشگاه
            </div>
            <div className="mt-5 space-y-5">
              {buyerSteps.map(s => (
                <div key={s.n} className="flex gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-xl bg-brand-600 text-white grid place-items-center font-black">
                    {s.n}
                  </div>
                  <div>
                    <div className="font-bold">{s.t}</div>
                    <p className="muted text-sm mt-1 leading-6">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 font-medium">
              مشاور رشد
            </div>
            <div className="mt-5 space-y-5">
              {mentorSteps.map(s => (
                <div key={s.n} className="flex gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-xl bg-emerald-600 text-white grid place-items-center font-black">
                    {s.n}
                  </div>
                  <div>
                    <div className="font-bold">{s.t}</div>
                    <p className="muted text-sm mt-1 leading-6">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}