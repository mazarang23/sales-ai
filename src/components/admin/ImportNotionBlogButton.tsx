"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ImportNotionBlogButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function importPosts() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/blog/import-notion", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "خطا در انتشار");
      router.refresh();
      window.alert(`۳ مقاله آماده/منتشر شد: ${data.imported?.length || 0} مقاله`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "انتشار انجام نشد.");
    } finally {
      setBusy(false);
    }
  }

  return <button onClick={importPosts} disabled={busy} className="btn-ghost text-sm disabled:opacity-50">{busy ? "در حال انتشار…" : "انتشار ۳ مقاله نُوشن"}</button>;
}
