const items = [
    { icon: "🔒", t: "داده‌های شما امن", d: "فایل شما فقط برای تحلیل استفاده می‌شود." },
    { icon: "⚡", t: "نتیجه در ۲ دقیقه", d: "بدون نیاز به دانش فنی." },
    { icon: "🤝", t: "مشاورین تاییدشده", d: "هر مشاور توسط تیم ما بررسی می‌شود." }
  ];
  
  export function TrustSignals() {
    return (
      <section className="py-8 border-b border-slate-200/60">
        <div className="container-tight grid gap-4 sm:grid-cols-3">
          {items.map(i => (
            <div key={i.t} className="flex items-start gap-3">
              <div className="text-2xl">{i.icon}</div>
              <div>
                <div className="font-medium text-sm">{i.t}</div>
                <div className="muted text-xs mt-1">{i.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }