"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Post = { id: string; title: string; slug: string; excerpt: string; body: string; published: boolean };

export function BlogEditor({ initial }: { initial: Post }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p)
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      setMsg("ذخیره شد");
      if (!p.id && j.id) router.push(`/admin/blog/${j.id}`);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("حذف شود؟")) return;
    await fetch("/api/admin/blog?id=" + p.id, { method: "DELETE" });
    router.push("/admin/blog");
  }

  return (
    <div className="card p-6 space-y-3 max-w-3xl">
      <input
        className="input"
        placeholder="عنوان"
        value={p.title}
        onChange={e => setP({ ...p, title: e.target.value })}
      />
      <input
        className="input font-mono"
        placeholder="slug (en)"
        value={p.slug}
        onChange={e => setP({ ...p, slug: e.target.value })}
      />
      <textarea
        className="input h-20"
        placeholder="خلاصه"
        value={p.excerpt}
        onChange={e => setP({ ...p, excerpt: e.target.value })}
      />
      <textarea
        className="input h-64 font-mono text-sm"
        placeholder="متن مقاله"
        value={p.body}
        onChange={e => setP({ ...p, body: e.target.value })}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={p.published}
          onChange={e => setP({ ...p, published: e.target.checked })}
        />
        منتشر شود
      </label>
      <div className="flex gap-2">
        <button onClick={save} disabled={busy} className="btn-primary">
          {busy ? "..." : "ذخیره"}
        </button>
        {p.id && (
          <button onClick={remove} className="btn-ghost text-red-600">
            حذف
          </button>
        )}
      </div>
      {msg && <div className="rounded-xl bg-slate-100 p-3 text-sm">{msg}</div>}
    </div>
  );
}