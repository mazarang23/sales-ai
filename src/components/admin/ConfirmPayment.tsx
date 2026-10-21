"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConfirmPayment({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    const r = await fetch(`/api/admin/bookings/${bookingId}/confirm-payment`, {
      method: "POST"
    });
    setBusy(false);
    if (r.ok) router.refresh();
  }

  return (
    <button onClick={confirm} disabled={busy} className="btn-primary text-xs">
      {busy ? "..." : "تایید پرداخت"}
    </button>
  );
}