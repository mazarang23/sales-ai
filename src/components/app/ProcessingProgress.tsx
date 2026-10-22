"use client";
import { useEffect, useMemo, useState } from "react";

export function ProcessingProgress({
  active,
  label = "در حال پردازش",
  stages = ["دریافت فایل", "خواندن داده‌ها", "آماده‌سازی تحلیل", "تقریباً تمام شد"]
}: {
  active: boolean;
  label?: string;
  stages?: string[];
}) {
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    if (!active) {
      setProgress(8);
      return;
    }
    const started = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const next = Math.min(94, 12 + Math.round(82 * (1 - Math.exp(-elapsed / 12000))));
      setProgress(next);
    }, 250);
    return () => window.clearInterval(timer);
  }, [active]);

  const stage = useMemo(() => {
    const index = Math.min(stages.length - 1, Math.floor((progress / 100) * stages.length));
    return stages[index];
  }, [progress, stages]);

  if (!active) return null;

  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4" dir="rtl" aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="font-medium">{label}</div>
        <div className="font-bold text-brand-700">{progress.toLocaleString("fa-IR")}٪</div>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-brand-600 transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>{stage}</span>
        <span>این درصد تقریبی است؛ تا آماده‌شدن نتیجه صفحه را نبند.</span>
      </div>
    </div>
  );
}
