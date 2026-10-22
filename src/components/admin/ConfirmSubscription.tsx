"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConfirmSubscription({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function confirmPayment() {
    if (!window.confirm("این پرداخت تایید شود؟ پلن کاربر فعال می‌شود.")) return;
    setBusy(true);
    const r = await fetch(`/api/admin/subscriptions/${subscriptionId}/confirm`, { method: "POST" });
    setBusy(false);
    if (r.ok) router.refresh();
  }

  return <button onClick={confirmPayment} disabled={busy} className="btn-primary text-xs">{busy ? "..." : "تایید پرداخت پلن"}</button>;
}
