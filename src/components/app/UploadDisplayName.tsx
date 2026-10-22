"use client";

import { useState } from "react";

export function UploadDisplayName({ id, initialName }: { id: string; initialName: string }) {
  const [name, setName] = useState(initialName);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    const value = draft.trim();
    if (!value || value.length > 100) {
      setError("نام باید بین ۱ تا ۱۰۰ کاراکتر باشد");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/uploads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: value })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "ذخیره نام انجام نشد");
      setName(result.upload.displayName);
      setDraft(result.upload.displayName);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره نام");
    } finally {
      setBusy(false);
    }
  }

  if (!editing) {
    return <div className="flex items-center gap-2 min-w-0">
      <div className="font-medium truncate max-w-[300px]">{name}</div>
      <button type="button" onClick={() => { setDraft(name); setEditing(true); setError(""); }} className="text-xs text-brand-700 underline shrink-0">ویرایش نام</button>
    </div>;
  }

  return <div className="w-full max-w-md">
    <div className="flex gap-2">
      <input aria-label="نام دلخواه فایل" maxLength={100} value={draft} onChange={event => setDraft(event.target.value)} className="input min-w-0 flex-1" />
      <button type="button" disabled={busy} onClick={save} className="btn-primary text-xs">{busy ? "در حال ذخیره…" : "ذخیره"}</button>
      <button type="button" disabled={busy} onClick={() => { setEditing(false); setDraft(name); setError(""); }} className="btn-ghost text-xs">لغو</button>
    </div>
    {error && <p role="alert" className="text-xs text-red-600 mt-1">{error}</p>}
  </div>;
}
