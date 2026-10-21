"use client";
import { useState } from "react";

export function PhotoUpload({
  current,
  onUploaded
}: {
  current: string | null;
  onUploaded: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(current);
  const [err, setErr] = useState<string | null>(null);

  async function pick(file: File | null) {
    if (!file) return;
    setErr(null);
    if (file.size > 2 * 1024 * 1024) {
      setErr("حجم عکس حداکثر ۲ مگابایت");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const r = await fetch("/api/consultant/upload-photo", {
        method: "POST",
        body: fd
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      setPreview(j.photoUrl);
      onUploaded(j.photoUrl);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="shrink-0">
        {preview ? (
          <img
            src={preview}
            alt="عکس پروفایل"
            className="h-20 w-20 rounded-2xl object-cover border border-slate-200"
          />
        ) : (
          <div className="h-20 w-20 rounded-2xl bg-slate-100 text-slate-400 grid place-items-center text-xs text-center px-2">
            بدون عکس
          </div>
        )}
      </div>
      <div>
        <label className="btn-ghost text-sm cursor-pointer inline-flex">
          {busy ? "در حال آپلود..." : "انتخاب عکس"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={e => pick(e.target.files?.[0] || null)}
            className="hidden"
            disabled={busy}
          />
        </label>
        {err && <div className="text-xs text-red-600 mt-1">{err}</div>}
        <div className="text-xs text-slate-500 mt-1">
          فرمت jpg/png/webp — حداکثر ۲MB
        </div>
      </div>
    </div>
  );
}