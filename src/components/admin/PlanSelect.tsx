"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const OPTIONS = [
  { value: "free", label: "رایگان" },
  { value: "pro", label: "رشد" },
  { value: "business", label: "حرفه‌ای" }
] as const;

export function PlanSelect({ userId, currentPlan }: { userId: string; currentPlan: string }) {
  const router = useRouter();
  const [value, setValue] = useState(OPTIONS.some(o => o.value === currentPlan) ? currentPlan : "free");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function changePlan(next: string) {
    if (next === value) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: next })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا در تغییر پلن");
      setValue(next);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطا در تغییر پلن");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-[170px]">
      <select
        value={value}
        disabled={busy}
        onChange={e => changePlan(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
      >
        {OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {busy && option.value === value ? "در حال ذخیره..." : option.label}
          </option>
        ))}
      </select>
      {err && <div className="mt-1 text-xs text-red-600">{err}</div>}
    </div>
  );
}