export function HeroVisual() {
  return (
    <div className="relative">
      <div className="card p-4 sm:p-5 shadow-glow">
        <div className="text-[10px] sm:text-xs text-slate-500 mb-2 sm:mb-3">داشبورد نمونه</div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-lg sm:rounded-xl bg-slate-50 p-2 sm:p-3">
            <div className="text-[9px] sm:text-[10px] text-slate-500">فروش</div>
            <div className="mt-1 text-xs sm:text-base font-bold">۱۸۲ م</div>
          </div>
          <div className="rounded-lg sm:rounded-xl bg-slate-50 p-2 sm:p-3">
            <div className="text-[9px] sm:text-[10px] text-slate-500">مشتری</div>
            <div className="mt-1 text-xs sm:text-base font-bold">۱٬۲۴۰</div>
          </div>
          <div className="rounded-lg sm:rounded-xl bg-emerald-50 p-2 sm:p-3">
            <div className="text-[9px] sm:text-[10px] text-emerald-700">رشد</div>
            <div className="mt-1 text-xs sm:text-base font-bold text-emerald-700">+۱۲٪</div>
          </div>
        </div>
        <div className="mt-3 sm:mt-4 h-20 sm:h-24 rounded-lg sm:rounded-xl bg-gradient-to-tr from-brand-100 via-white to-emerald-100 flex items-end p-2 sm:p-3 gap-0.5 sm:gap-1">
          {[40, 60, 45, 70, 55, 80, 90, 75, 95].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-brand-500/60"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-3 sm:mt-4 rounded-lg sm:rounded-xl bg-slate-50 p-2 sm:p-3 text-[10px] sm:text-xs">
          <div className="text-slate-500 mb-1">پیشنهاد AI</div>
          <div className="text-slate-700 leading-4 sm:leading-5">
            کمپین بازگشت مشتریان قدیمی می‌تواند ۱۵٪ فروش اضافه کند.
          </div>
        </div>
      </div>
    </div>
  );
}