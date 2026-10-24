"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConsultantApprove({ consultantId, status }: { consultantId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function act(action: "approve" | "reject" | "show" | "hide") {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/consultants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consultantId, action }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ذخیره تغییر انجام نشد");
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "خطا در ذخیره"); }
    finally { setBusy(false); }
  }

  return <div className="flex flex-col items-end gap-2 shrink-0">
    <div className="flex flex-wrap gap-2">
      {status === "pending" && <>
        <button onClick={() => act("approve")} disabled={busy} className="btn-primary text-xs">{busy ? "..." : "تایید و فعال‌سازی"}</button>
        <button onClick={() => act("reject")} disabled={busy} className="btn-ghost text-red-600 text-xs">رد درخواست</button>
      </>}
      {status === "approved" && <button onClick={() => act("hide")} disabled={busy} className="btn-ghost text-xs">{busy ? "..." : "غیرفعال کردن در سایت"}</button>}
      {status === "approved_hidden" && <button onClick={() => act("show")} disabled={busy} className="btn-primary text-xs">{busy ? "..." : "فعال کردن در سایت"}</button>}
      {status === "rejected" && <button onClick={() => act("approve")} disabled={busy} className="btn-ghost text-xs">تایید و فعال‌سازی</button>}
    </div>
    {error && <p className="text-xs text-red-600 max-w-48">{error}</p>}
  </div>;
}
