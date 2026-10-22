const items = [
  { icon: "◈", t: "از داده خام تا اقدام", d: "RFM، کوهورت و شاخص‌های فروش را کنار هم ببین؛ نه فقط یک جدول خام." },
  { icon: "✦", t: "AI برای تصمیم، نه نمایش", d: "پاسخ‌های AI بر پایه داده و تحلیل خود فروش‌یار ساخته می‌شوند." },
  { icon: "↗", t: "وقتی آماده‌ای، مشاور بگیر", d: "اگر تحلیل به اقدام تخصصی نیاز داشت، مسیر مشاوره هم در همان پلتفرم است." }
];

export function TrustSignals() {
  return (
    <section className="relative border-y border-slate-200/70 bg-white/80 py-7 sm:py-9">
      <div className="container-tight grid gap-5 sm:grid-cols-3 sm:gap-8">
        {items.map(i => (
          <div key={i.t} className="group flex items-start gap-3 rounded-2xl p-3 transition hover:bg-slate-50">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-lg font-bold text-brand-700 ring-1 ring-brand-100">
              {i.icon}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">{i.t}</div>
              <div className="muted mt-1 text-xs leading-6">{i.d}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
