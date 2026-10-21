"use client";
import { useState } from "react";

export function OnlinePayButton({
  endpoint,
  body,
  label = "پرداخت آنلاین"
}: {
  endpoint: string;
  body?: Record<string, any>;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body || {})
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      window.location.href = j.redirectUrl;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطا");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button onClick={pay} disabled={busy} className="btn-primary w-full py-3">
        {busy ? "در حال اتصال به درگاه..." : label}
      </button>
      {err && <div className="text-sm text-red-600">{err}</div>}
    </div>
  );
}