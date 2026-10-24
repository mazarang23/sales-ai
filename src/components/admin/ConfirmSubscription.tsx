"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConfirmSubscription({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false);
  async function approve() { if (!window.confirm("این رسید تایید شود؟ پلن کاربر فعال می‌شود.")) return; setBusy(true); const r = await fetch(`/api/admin/subscriptions/${subscriptionId}/confirm`, { method: "POST" }); setBusy(false); if (r.ok) router.refresh(); }
  async function reject() { const reason = window.prompt("دلیل رد رسید (اختیاری):") || "رسید یا اطلاعات پرداخت قابل تایید نیست"; setBusy(true); const r = await fetch(`/api/admin/subscriptions/${subscriptionId}/reject`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) }); setBusy(false); if (r.ok) router.refresh(); }
  return <div className="flex gap-2"><button onClick={approve} disabled={busy} className="btn-primary text-xs">{busy ? "..." : "تایید پرداخت"}</button><button onClick={reject} disabled={busy} className="btn-ghost text-xs text-red-700">رد رسید</button></div>;
}
