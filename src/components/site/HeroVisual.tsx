export function HeroVisual() {
  const bars = [38, 55, 46, 68, 58, 76, 64, 84, 72];

  return (
    <div className="relative">
      <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-brand-100/50 blur-2xl" />
      <div className="card overflow-hidden border-white/80 bg-white/95 p-4 shadow-glow sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-medium text-slate-500 sm:text-xs">پیش‌نمایش نمایشی</div>
            <div className="mt-1 text-sm font-bold text-slate-900 sm:text-base">از داده تا تصویر قابل‌فهم</div>
          </div>
          <div className="rounded-full bg-brand-50 px-2 py-1 text-[9px] font-semibold text-brand-700 sm:text-[10px]">نمونه رابط</div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-2"><div className="text-[9px] font-semibold text-slate-600">روند فروش</div><div className="mt-2 flex h-8 items-end gap-1">{[35,58,44,72,62,86].map((h,i)=><div key={i} className="flex-1 rounded-t bg-brand-500/70" style={{height:h+"%"}} />)}</div></div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-2"><div className="text-[9px] font-semibold text-slate-600">RFM</div><div className="mt-2 space-y-1.5">{[["وفادار","w-full","bg-emerald-400"],["در معرض ریزش","w-4/5","bg-amber-400"],["نیازمند رشد","w-3/5","bg-sky-400"]].map(([label,width,color])=><div key={label}><div className="mb-0.5 text-[8px] text-slate-500">{label}</div><div className="h-1 rounded-full bg-slate-200"><div className={"h-1 rounded-full "+width+" "+color} /></div></div>)}</div></div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-2"><div className="text-[9px] font-semibold text-slate-600">کوهورت</div><div className="mt-2 grid grid-cols-4 gap-1">{["bg-emerald-500/80","bg-emerald-400/70","bg-sky-400/60","bg-slate-100","bg-emerald-500/70","bg-sky-400/60","bg-sky-300/50","bg-slate-100","bg-emerald-400/60","bg-sky-300/50","bg-slate-100","bg-slate-100"].map((color,i)=><div key={i} className={"h-2.5 rounded-sm "+color} />)}</div></div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {[
            ["مشتریان", "تقسیم‌بندی"],
            ["خرید", "الگوهای بازگشت"],
            ["اقدام", "اولویت بعدی"]
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-2.5 sm:p-3">
              <div className="text-[9px] text-slate-500 sm:text-[10px]">{label}</div>
              <div className="mt-1 text-[10px] font-bold text-slate-800 sm:text-xs">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-xl border border-slate-100 bg-gradient-to-tr from-brand-50 via-white to-emerald-50 p-3 sm:mt-4 sm:p-4">
          <div className="flex h-24 items-end gap-1 sm:h-28">
            {bars.map((height, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-brand-500/60" style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[9px] text-slate-400 sm:text-[10px]">
            <span>دوره‌های خرید</span>
            <span>روند</span>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-brand-100 bg-brand-50/70 p-3 sm:mt-4 sm:p-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-brand-800 sm:text-xs">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white">✦</span>
            پیشنهاد مبتنی بر داده
          </div>
          <div className="mt-2 text-[10px] leading-5 text-slate-700 sm:text-xs sm:leading-6">
            مشتریان ارزشمند را جدا کن، الگوی بازگشت را ببین و قبل از اجرای کمپین، اولویت اقدام را مشخص کن.
          </div>
        </div>
      </div>
    </div>
  );
}
