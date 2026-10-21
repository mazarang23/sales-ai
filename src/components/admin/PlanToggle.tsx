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
  const [open, setOpen] = useState(false);

  async function change(plan: string) {
    if (plan === currentPlan) {
      setOpen(false);
      return;
    }
    if (!confirm(`پلن به «${PLANS.find(p => p.v === plan)?.l}» تغییر کند؟`)) return;
    setBusy(true);
    try {
      const r = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan })
      });
      if (!r.ok) throw new Error("خطا");
      setOpen(false);
      router.refresh();
    } catch (e) {
      alert("خطا در تغییر پلن");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={busy}
        className="text-xs rounded-lg border border-slate-200 px-2 py-1 hover:border-slate-300 disabled:opacity-50"
      >
        {busy ? "..." : "تغییر"}
      </button>
      {open && (
        <div className="absolute left-0 mt-1 z-10 bg-white border border-slate-200 rounded-lg shadow-lg p-1 min-w-[100px]">
          {PLANS.map(p => (
            <button
              key={p.v}
              onClick={() => change(p.v)}
              className={`block w-full text-right text-xs px-2 py-1.5 rounded hover:bg-slate-100 ${
                p.v === currentPlan ? "text-brand-600 font-medium" : ""
              }`}
            >
              {p.l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}