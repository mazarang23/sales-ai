import { notFound } from "next/navigation";

const DATA: Record<string, { title: string; intro: string; bullets: string[] }> = {
  clothing: {
    title: "تحلیل فروش برای فروشگاه پوشاک",
    intro: "پوشاک، فصلی است. تشخیص مشتریان در خطر، پیش از تغییر فصل، تفاوت را می‌سازد.",
    bullets: ["کشف سایز و رنگ پرفروش", "تشخیص مشتریان در خطر ریزش", "پیشنهاد کمپین بازگشت مشتری"]
  },
  gold: {
    title: "تحلیل فروش برای فروشگاه طلا",
    intro: "در طلا، مشتری وفادار، سرمایه است. تحلیل رفتار خرید VIP‌ها حیاتی است.",
    bullets: ["تحلیل LTV مشتریان VIP", "کشف الگوی خرید مناسبت‌ها", "پیشنهاد باشگاه مشتریان"]
  },
  cosmetics: {
    title: "تحلیل فروش برای فروشگاه آرایشی",
    intro: "تکرار خرید، بازی اصلی در آرایشی است. RFM را جدی بگیر.",
    bullets: ["نرخ تکرار خرید", "محصولات مکمل", "کشف مشتریان در خطر"]
  },
  restaurant: {
    title: "تحلیل فروش برای رستوران",
    intro: "رستوران‌ها با داده، منوی بهتری می‌چینند و مشتری ثابت می‌سازند.",
    bullets: ["تحلیل آیتم‌های منو", "ساعت‌های اوج", "بازگشت مشتری"]
  },
  grocery: {
    title: "تحلیل فروش برای سوپرمارکت",
    intro: "سبد خرید، گنج پنهان سوپرمارکت‌هاست.",
    bullets: ["تحلیل سبد", "کالاهای مکمل", "مشتریان پرمصرف"]
  },
  digital: {
    title: "تحلیل فروش برای فروشگاه دیجیتال",
    intro: "در دیجیتال، مارجین کم است. تحلیل درست، حیاتی است.",
    bullets: ["پرفروش‌ها و خواب سرمایه", "تحلیل تخفیف", "کشف مشتریان VIP"]
  }
};

export function generateStaticParams() {
  return Object.keys(DATA).map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const d = DATA[params.slug];
  if (!d) return { title: "صنف نامشخص" };
  return { title: d.title, description: d.intro };
}

export default function IndustryPage({ params }: { params: { slug: string } }) {
  const d = DATA[params.slug];
  if (!d) notFound();
  return (
    <section className="container-tight py-20 max-w-3xl">
      <h1 className="h1">{d.title}</h1>
      <p className="muted mt-4 text-lg leading-8">{d.intro}</p>
      <ul className="mt-8 space-y-3">
        {d.bullets.map(b => (
          <li key={b} className="card p-4 flex items-center gap-3">
            <span className="text-emerald-600">✓</span>{b}
          </li>
        ))}
      </ul>
      <a href="/register" className="btn-primary mt-10 px-6 py-3">تحلیل رایگان فروشگاه من</a>
    </section>
  );
}