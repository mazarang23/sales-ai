"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProcessingProgress } from "./ProcessingProgress";

const MAX_SIZE = 10 * 1024 * 1024;
type Upload = { id: string; fileName: string; rowCount: number; createdAt: string };

export function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [limitInfo, setLimitInfo] = useState<{ maxRows: number; currentPlan: string } | null>(null);
  const [appendMode, setAppendMode] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [selectedUploadId, setSelectedUploadId] = useState<string>("");

  useEffect(() => { fetch("/api/uploads/list").then(r => r.json()).then(j => setUploads(j.uploads || [])).catch(() => {}); }, []);
  function pick(f: File | null) { setErr(null); setLimitInfo(null); if (!f) return setFile(null); if (f.size > MAX_SIZE) return setErr("فایل بزرگ‌تر از ۱۰ مگابایت است"); setFile(f); }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!file) return; if (appendMode && !selectedUploadId) return setErr("آپلود قبلی را انتخاب کنید");
    setBusy(true); setErr(null); setLimitInfo(null);
    try {
      const fd = new FormData(); fd.append("file", file); if (appendMode && selectedUploadId) fd.append("appendToUploadId", selectedUploadId);
      const r = await fetch("/api/uploads", { method: "POST", body: fd }); const text = await r.text(); let j: any;
      try { j = JSON.parse(text); } catch { throw new Error("پاسخ سرور معتبر نبود."); }
      if (!r.ok) { if (j.code === "ROW_LIMIT") { setLimitInfo({ maxRows: j.maxRows, currentPlan: j.currentPlan }); setErr(j.error); } else throw new Error(j.error || "خطا در آپلود"); setBusy(false); return; }
      router.push(j.appended ? `/dashboard/${j.uploadId}` : `/mapping/${j.uploadId}`);
    } catch (e) { setErr(e instanceof Error ? e.message : "خطا"); setBusy(false); }
  }

  return <form onSubmit={submit} className="card p-6 space-y-4">
    <div><label className="text-sm font-medium">فایل اکسل فروش</label><input type="file" accept=".xlsx,.xls,.csv" onChange={e => pick(e.target.files?.[0] || null)} className="input mt-1 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-brand-700" />{file && <div className="mt-2 text-xs text-slate-500">{file.name} — {(file.size / 1024).toFixed(1)} KB</div>}</div>
    {uploads.length > 0 && <div className="rounded-xl border border-slate-200 p-3 space-y-2"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={appendMode} onChange={e => setAppendMode(e.target.checked)} /><span className="text-sm font-medium">افزودن به آپلود قبلی</span></label>{appendMode && <><select className="input mt-1" value={selectedUploadId} onChange={e => setSelectedUploadId(e.target.value)} required><option value="">— انتخاب آپلود قبلی —</option>{uploads.map(u => <option key={u.id} value={u.id}>{u.fileName} ({u.rowCount.toLocaleString("fa-IR")} ردیف)</option>)}</select><p className="text-xs text-slate-500 leading-5">ردیف‌های این فایل به آپلود انتخابی اضافه می‌شوند و تحلیل‌ها روی کل داده انجام می‌شود.</p></>}</div>}
    {err && <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm space-y-2"><div>{err}</div>{limitInfo && <a href="/account/upgrade" className="inline-block text-brand-600 font-medium">ارتقای پلن ←</a>}</div>}
    <ProcessingProgress active={busy} label="در حال آپلود و آماده‌سازی تحلیل" />
    <button disabled={!file || busy} className="btn-primary w-full py-3">{busy ? "در حال پردازش..." : "آپلود و ادامه"}</button>
  </form>;
}
