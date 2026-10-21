import Link from "next/link";

const industries = [
  { slug: "clothing", label: "پوشاک" },
  { slug: "gold", label: "طلا" },
  { slug: "cosmetics", label: "آرایشی" },
  { slug: "restaurant", label: "رستوران" },
  { slug: "grocery", label: "سوپرمارکت" },
  { slug: "digital", label: "دیجیتال" }
];

export function IndustryLinks() {
  return (
    <section className="py-20">
      <div className="container-tight">
        <h2 className="h2">برای صنف شما</h2>
        <p className="muted mt-3">هر صنف، بینش‌های مخصوص خودش را دارد.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {industries.map(i => (
            <Link key={i.slug} href={`/industry/${i.slug}`}
              className="card p-4 text-center hover:shadow-glow transition">
              <div className="text-lg font-bold">{i.label}</div>
              <div className="muted mt-1 text-xs">مشاهده تحلیل</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}