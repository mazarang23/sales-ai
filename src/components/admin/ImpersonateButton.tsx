"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ImpersonateButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    if (!confirm("مطمئنی؟ Session ادمین بسته می‌شود.")) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/admin/users/${userId}/impersonate`, {
        method: "POST"
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      router.push(j.redirect || "/dashboard");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطا");
      setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={go} disabled={busy} className="btn-primary w-full py-3">
        {busy ? "..." : "ورود به پنل کاربر"}
      </button>
      {err && (
        <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm mt-3">
          {err}
        </div>
      )}
    </div>
  );
}