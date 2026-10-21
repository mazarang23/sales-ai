"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PlanToggle({ userId, currentPlan }: { userId: string; currentPlan: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = currentPlan === "pro" ? "free" : "pro";
    if (!confirm(`پلن به ${next === "pro" ? "حرفه‌ای" : "رایگان"} تغییر کند؟`)) return;
    setBusy(true);
    await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, plan: next })
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button onClick={toggle} disabled={busy} className="text-xs rounded-lg border px-2 py-1 hover:border-slate-300 disabled:opacity-50">
      {busy ? "..." : currentPlan === "pro" ? "→ رایگان" : "→ حرفه‌ای"}
    </button>
  );
}