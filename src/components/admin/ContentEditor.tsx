"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; key: string; type: string; value: string };

export function ContentEditor({ initial }: { initial: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function update(id: string, value: string) {
    setItems(items.map(it => it.id === id ? { ...it, value } : it));
  }

  async function save(id: string) {
    setBusy(id);
    setMsg(null);
    const it = items.find(x => x.id === id);
    if (!it) return;
    const r = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, key: it.key, type: it.type, value: it.value })
    });
    setBusy(null);
    if (r.ok) {
      setMsg("ذخیره شد");
      router.refresh();
    } else {
      setMsg("خطا در ذخیره");
    }
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="card p-6 muted">
          محتوایی ثبت نشده. با seed پر می‌شود یا از اینجا اضافه کن.
        </div>
      )}
      {items.map(it => (
        <div key={it.id} className="card p-4">
          <div className="flex items-center justify-between">
            <div className="font-mono text-xs text-slate-500">{it.key}</div>
            <span className="text-xs rounded bg-slate-100 px-2 py-0.5">{it.type}</span>
          </div>
          {it.type === "richtext" ? (
            <textarea
              className="input mt-2 h-32"
              value={it.value}
              onChange={e => update(it.id, e.target.value)}
            />
          ) : (
            <input
              className="input mt-2"
              value={it.value}
              onChange={e => update(it.id, e.target.value)}
            />
          )}
          <button
            onClick={() => save(it.id)}
            disabled={busy === it.id}
            className="btn-primary mt-3 text-sm"
          >
            {busy === it.id ? "..." : "ذخیره"}
          </button>
        </div>
      ))}
      {msg && <div className="rounded-xl bg-slate-100 p-3 text-sm">{msg}</div>}
    </div>
  );
}