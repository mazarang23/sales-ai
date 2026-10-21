"use client";
import { useState } from "react";

export function ReportButton({ uploadId }: { uploadId?: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    if (!text.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, uploadId })
      });
      if (!r.ok) throw new Error("خطا در ارسال");
      setMsg("گزارش شما ثبت شد. ممنون!");
      setText("");
      setTimeout(() => { setOpen(false); setMsg(null); }, 2000);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-ghost text-xs text-slate-500">
        گزارش خرابی
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3" dir="rtl">
        <div className="font-bold">گزارش خرابی</div>
        <p className="muted text-sm">چه چیزی درست کار نمی‌کند؟</p>
        <textarea
          className="input h-28"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="مثلاً: تاریخ‌ها در نمودار درست نمایش داده نمی‌شوند..."
        />
        {msg && <div className="rounded-xl bg-slate-100 p-2 text-sm">{msg}</div>}
        <div className="flex gap-2">
          <button onClick={submit} disabled={busy || !text.trim()} className="btn-primary">
            {busy ? "..." : "ارسال"}
          </button>
          <button onClick={() => setOpen(false)} className="btn-ghost">لغو</button>
        </div>
      </div>
    </div>
  );
}