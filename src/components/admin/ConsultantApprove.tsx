"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConsultantApprove({ consultantId }: { consultantId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "approve" | "reject") {
    setBusy(true);
    await fetch("/api/admin/consultants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consultantId, action })
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button onClick={() => act("approve")} disabled={busy} className="btn-primary text-xs">
        {busy ? "..." : "تایید"}
      </button>
      <button onClick={() => act("reject")} disabled={busy} className="btn-ghost text-red-600 text-xs">
        رد
      </button>
    </div>
  );
}