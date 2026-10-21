"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function BookingActions({
  bookingId,
  status
}: {
  bookingId: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function act(action: "accept" | "reject" | "complete") {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/bookings/${bookingId}/${action}`, {
        method: "POST"
      });
      const text = await r.text();
      if (!text) {
        throw new Error("پاسخی از سرور دریافت نشد.");
      }
      let j: any;
      try {
        j = JSON.parse(text);
      } catch {
        throw new Error("پاسخ سرور معتبر نبود.");
      }
      if (!r.ok) throw new Error(j.error || "خطا");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2 items-center">
      {status === "pending" && (
        <>
          <button
            onClick={() => act("accept")}
            disabled={busy}
            className="btn-primary text-xs"
          >
            تایید
          </button>
          <button
            onClick={() => act("reject")}
            disabled={busy}
            className="btn-ghost text-red-600 text-xs"
          >
            رد
          </button>
        </>
      )}
      {status === "accepted" && (
        <button
          onClick={() => act("complete")}
          disabled={busy}
          className="btn-primary text-xs"
        >
          تکمیل شد
        </button>
      )}
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}