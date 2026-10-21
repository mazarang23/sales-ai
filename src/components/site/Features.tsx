const items = [
  {
    t: "تحلیل هوشمند فروش",
    d: "با آپلود اکسل، KPIها، روند فروش، و پرفروش‌ترین محصولات را ببین."
  },
  {
    t: "بخش‌بندی مشتریان (RFM)",
    d: "مشتریان وفادار، در خطر، و از دست رفته را بشناس تا درست هدف بگیری."
  },
  {
    t: "مشاور هوش مصنوعی فروشیار",
    d: "برنامه رشد مبتنی بر داده، با هزینه و اثر تخمینی برای هر اقدام."
  },
  {
    t: "مشاورین خبره انسانی",
    d: "با مشاورین تاییدشده جلسه بگیر و قدم‌به‌قدم فروشگاهت را بزرگ کن."
  },
  {
    t: "رزرو جلسه و چت امن",
    d: "درخواست جلسه بده، با مشاور چت کن، و بعد از جلسه امتیاز بده."
  },
  {
    t: "تحلیل تک‌مشتری و تک‌محصول",
    d: "رفتار خرید هر مشتری و فروش هر محصول را دقیق بررسی کن."
  }
];

export function Features({
  title,
  subtitle
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section id="features" className="py-20 bg-white border-y border-slate-200">
      <div className="container-tight">
        <div className="max-w-2xl">
          <h2 className="h2">{title || "تحلیل + مشاوره، در یک پلتفرم"}</h2>
          <p className="muted mt-3">
            {subtitle || "از داده‌ی خام اکسل تا اقدام عملی، بدون فرمول و بدون پیچیدگی."}
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(i => (
            <div key={i.t} className="card p-6 hover:shadow-glow transition">
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center font-black">
                ✓
              </div>
              <div className="mt-4 font-bold">{i.t}</div>
              <p className="muted mt-2 text-sm leading-6">{i.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}