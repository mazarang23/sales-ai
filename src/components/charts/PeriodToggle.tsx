"use client";
import { Period } from "@/lib/analytics/periods";
import { useRouter, usePathname } from "next/navigation";

const OPTIONS: { value: Period; label: string }[] = [
  { value: "day", label: "روزانه" },
  { value: "week", label: "هفتگی" },
  { value: "month", label: "ماهانه" }
];

export function PeriodToggle({ current }: { current: Period }) {
  const router = useRouter();
  const pathname = usePathname();

  function handle(value: Period) {
    router.push(`${pathname}?period=${value}`);
  }

  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-sm">
      {OPTIONS.map(o => (
        <button
          key={o.value}
          onClick={() => handle(o.value)}
          className={`rounded-lg px-3 py-1 transition ${
            current === o.value
              ? "bg-brand-600 text-white"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}