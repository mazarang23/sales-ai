"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteUploadButton({ uploadId }: { uploadId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!confirm("این آپلود و همه داده‌هایش حذف شود؟ قابل بازگشت نیست.")) return;
    setBusy(true);
    const r = await fetch(`/api/uploads/${uploadId}/delete`, { method: "POST" });
    setBusy(false);
    if (r.ok) router.push("/dashboard");
  }

  return (
    <button onClick={del} disabled={busy} className="btn-ghost text-red-600 text-sm">
      {busy ? "..." : "حذف آپلود"}
    </button>
  );
}