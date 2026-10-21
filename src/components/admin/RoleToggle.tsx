"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RoleToggle({
  userId,
  currentRole,
  isSelf
}: {
  userId: string;
  currentRole: "USER" | "ADMIN";
  isSelf: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function toggle() {
    if (isSelf) {
      setErr("نمی‌توانی نقش خودت را تغییر بدهی");
      return;
    }
    const next = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`نقش کاربر به ${next === "ADMIN" ? "ادمین" : "کاربر"} تغییر کند؟`)) return;

    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={toggle}
        disabled={busy || isSelf}
        className="text-xs rounded-lg border border-slate-200 px-2 py-1 hover:border-slate-300 disabled:opacity-50"
      >
        {busy ? "..." : currentRole === "ADMIN" ? "عضو → کاربر" : "ارتقا → ادمین"}
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}