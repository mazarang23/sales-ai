const items = [
  { q: "داده‌ام امن است؟", a: "بله. فایل شما فقط برای تحلیل استفاده می‌شود و در اختیار کسی قرار نمی‌گیرد." },
  { q: "اگر اکسل‌ام به‌هم‌ریخته باشد چه؟", a: "ما ستون‌ها را خودکار تشخیص می‌دهیم. اگر جایی اشتباه بود، خودت می‌توانی در صفحه Mapping اصلاح کنی." },
  { q: "چه فرمت‌هایی پشتیبانی می‌شود؟", a: "xlsx، xls و csv. هر تعداد شیت." },
  { q: "رایگان است؟", a: "تحلیل اولیه تا ۵۰۰۰ ردیف رایگان است. برای برنامه رشد کامل و مشاور AI، پلن‌های پولی داریم." }
];

export function FAQ() {
  return (
    <section className="py-20 bg-white border-y border-slate-200">
      <div className="container-tight max-w-3xl">
        <h2 className="h2">سوالات متداول</h2>
        <div className="mt-8 divide-y divide-slate-200">
          {items.map(i => (
            <details key={i.q} className="group py-4">
              <summary className="cursor-pointer list-none flex items-center justify-between font-semibold">
                {i.q}
                <span className="text-brand-600 group-open:rotate-45 transition">+</span>
              </summary>
              <p className="muted mt-3 text-sm leading-6">{i.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}