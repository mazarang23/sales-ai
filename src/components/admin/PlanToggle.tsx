"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const PLANS = [
  { v: "free", l: "رایگان" },
  { v: "pro", l: "رشد" },
  { v: "business", l: "حرفه‌ای" }
];

export function PlanToggle({
  userId,
  currentPlan
}: {
  userId: string;
  currentPlan: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function change(plan: string) {
    if (plan === currentPlan) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan })
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "خطا در تغییر پلن");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطا در تغییر پلن");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-[130px]">
      <select
        value={currentPlan}
        disabled={busy}
        onChange={e => change(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
        aria-label="تغییر پلن کاربر"
      >
        {PLANS.map(p => (
          <option key={p.v} value={p.v}>
            {busy && p.v === currentPlan ? "در حال ذخیره..." : p.l}
          </option>
        ))}
      </select>
      {err && <div className="mt-1 text-xs text-red-600">{err}</div>}
    </div>
  );
}