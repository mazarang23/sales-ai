"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { CURRENCIES, Currency } from "@/lib/excel/currency";
import { DraggableColumn } from "./DraggableColumn";
import { DroppableField } from "./DroppableField";

const FIELDS = [
  { k: "customer", l: "مشتری" },
  { k: "product", l: "محصول" },
  { k: "amount", l: "مبلغ" },
  { k: "date", l: "تاریخ" },
  { k: "orderId", l: "شماره سفارش" }
];

type Merge = { name: string; from: string[] };
type ProgressState = { processed: number; total: number; percent: number; etaMs: number | null };

function formatEta(ms: number | null) {
  if (ms == null) return "در حال محاسبه زمان باقی‌مانده…";
  if (ms < 1000) return "تقریباً تمام شد";
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds} ثانیه باقی مانده`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} دقیقه باقی مانده`;
}

export function MappingEditor({
  uploadId,
  initialHeaders,
  initialFieldMap,
  initialMerges,
  initialCurrency,
  preview
}: {
  uploadId: string;
  initialHeaders: string[];
  initialFieldMap: Record<string, string>;
  initialMerges: Merge[];
  initialCurrency?: Currency;
  preview: any[];
}) {
  const router = useRouter();
  const [headers, setHeaders] = useState<string[]>(initialHeaders);
  const [fieldMap, setFieldMap] = useState<Record<string, string>>(initialFieldMap || {});
  const [merges, setMerges] = useState<Merge[]>(initialMerges || []);
  const [currency, setCurrency] = useState<Currency>(initialCurrency || "rial");
  const [busyMerge, setBusyMerge] = useState(false);
  const [busySave, setBusySave] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const usedColumns = useMemo(() => {
    const used = new Set<string>();
    for (const v of Object.values(fieldMap)) if (v) used.add(v);
    for (const m of merges) for (const f of m.from) used.add(f);
    return used;
  }, [fieldMap, merges]);

  const selectedColumns = useMemo(() => {
    const cols = new Set<string>();
    for (const v of Object.values(fieldMap)) if (v) cols.add(v);
    for (const m of merges) if (m.name) cols.add(m.name);
    return Array.from(cols);
  }, [fieldMap, merges]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeData = active.data.current as { column?: string } | undefined;
    const overData = over.data.current as { field?: string } | undefined;
    const column = activeData?.column;
    const field = overData?.field;
    if (!column || !field) return;
    setFieldMap(prev => ({ ...prev, [field]: column }));
  }

  function clearField(k: string) {
    setFieldMap(prev => {
      const copy = { ...prev };
      delete copy[k];
      return copy;
    });
  }

  function addMerge() {
    setMerges(prev => [...prev, { name: "", from: [] }]);
  }

  function updateMergeName(i: number, name: string) {
    setMerges(prev => prev.map((m, idx) => (idx === i ? { ...m, name } : m)));
  }

  function toggleMergeFrom(i: number, h: string) {
    setMerges(prev => prev.map((m, idx) => {
      if (idx !== i) return m;
      const from = m.from.includes(h) ? m.from.filter(x => x !== h) : [...m.from, h];
      return { ...m, from };
    }));
  }

  function removeMerge(i: number) {
    setMerges(prev => prev.filter((_, idx) => idx !== i));
  }

  async function applyMerges() {
    const valid = merges.filter(m => m.name.trim() && m.from.length > 0);
    if (valid.length === 0) {
      setMsg("هیچ ادغام معتبری وجود ندارد");
      return;
    }
    setBusyMerge(true);
    setMsg(null);
    try {
      const r = await fetch(`/api/uploads/${uploadId}/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merges: valid })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      setHeaders(j.headers);
      setMsg("ادغام اعمال شد. ستون جدید در لیست بالا ظاهر شد ✓");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusyMerge(false);
    }
  }

  async function saveMapping() {
    setBusySave(true);
    setProgress({ processed: 0, total: 0, percent: 0, etaMs: null });
    setMsg(null);
    try {
      const validMerges = merges.filter(m => m.name.trim() && m.from.length > 0);
      const r = await fetch(`/api/uploads/${uploadId}/mapping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldMap, merges: validMerges, currency })
      });
      if (!r.ok || !r.body) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || "خطا در شروع تحلیل");
      }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let completed = false;

      const handleEvent = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line) as ProgressState & { type: string; updated?: number; headers?: string[]; error?: string };
        if (event.type === "progress") {
          setProgress({ processed: event.processed, total: event.total, percent: event.percent, etaMs: event.etaMs });
        } else if (event.type === "error") {
          throw new Error(event.error || "خطا در ذخیره نگاشت");
        } else if (event.type === "done") {
          completed = true;
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) handleEvent(line);
        }
        if (done) break;
      }
      if (buffer.trim()) handleEvent(buffer);
      if (!completed) throw new Error("فرآیند تحلیل کامل نشد");
      setProgress(prev => prev ? { ...prev, percent: 100, processed: prev.total } : { processed: 0, total: 0, percent: 100, etaMs: 0 });
      router.push(`/dashboard/${uploadId}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "خطا");
      setBusySave(false);
      setProgress(null);
    }
  }

  const showProgress = busySave && progress;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {showProgress && (
          <div className="card p-6 border-brand-200 bg-brand-50/40" aria-live="polite">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <div className="font-bold">در حال ذخیره نگاشت و آماده‌سازی تحلیل</div>
                <div className="text-xs text-slate-600 mt-1">
                  {progress.total > 0 ? `${progress.processed.toLocaleString("fa-IR")} از ${progress.total.toLocaleString("fa-IR")} ردیف پردازش شده` : "در حال آماده‌سازی ردیف‌ها…"}
                </div>
              </div>
              <div className="text-2xl font-bold text-brand-700 tabular-nums">{progress.percent.toLocaleString("fa-IR", { maximumFractionDigits: 1 })}%</div>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white border border-brand-100">
              <div className="h-full rounded-full bg-brand-600 transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, progress.percent))}%` }} />
            </div>
            <div className="mt-2 text-xs text-slate-500 text-center">{formatEta(progress.etaMs)}</div>
          </div>
        )}

        <div className="card p-6">
          <div className="font-bold mb-1">۱. نگاشت ستون‌ها</div>
          <p className="muted text-sm mb-4">ستون‌ها را از لیست سمت راست به فیلدهای سمت چپ بکش. یا روی فیلد کلیک کن و از dropdown انتخاب کن.</p>
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div>
              <div className="text-xs text-slate-500 mb-2 font-medium">ستون‌های فایل ({headers.length})</div>
              <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto p-2 rounded-xl bg-slate-50">
                {headers.map(h => <DraggableColumn key={h} id={h} used={usedColumns.has(h)} />)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-2 font-medium">فیلدهای موردنیاز</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {FIELDS.map(f => (
                  <DroppableField key={f.k} id={f.k} label={f.l} value={fieldMap[f.k]} headers={headers}
                    onSelect={col => setFieldMap(prev => ({ ...prev, [f.k]: col }))}
                    onClear={() => clearField(f.k)} />
                ))}
              </div>
              {!fieldMap.amount && !fieldMap.date && (
                <div className="mt-3 rounded-xl bg-amber-50 text-amber-800 p-3 text-xs">⚠️ حداقل ستون «مبلغ» یا «تاریخ» را انتخاب کن. در غیر این صورت تحلیل‌ها صفر می‌شوند.</div>
              )}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="font-bold mb-1">واحد پول فایل</div>
          <p className="muted text-sm mb-4">مبلغ‌های فایل با چه واحدی ثبت شده‌اند؟ مقدارها قبل از تحلیل به واحد پایهٔ ریال تبدیل می‌شوند.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {CURRENCIES.map(c => (
              <label key={c.value} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 cursor-pointer hover:border-brand-500">
                <input type="radio" name="currency" value={c.value} checked={currency === c.value} onChange={() => setCurrency(c.value)} />
                <span className="text-sm">{c.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="font-bold">۲. ادغام ستون‌ها (اختیاری)</div>
            <button type="button" onClick={addMerge} className="btn-ghost text-sm">+ افزودن ادغام</button>
          </div>
          <p className="muted text-sm mb-4">مثلاً «نام» + «نام خانوادگی» به «نام کامل».</p>
          <div className="space-y-4">
            {merges.map((m, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-4">
                <div className="flex gap-2 items-center">
                  <input className="input" placeholder="نام ستون جدید" value={m.name} onChange={e => updateMergeName(i, e.target.value)} />
                  <button type="button" onClick={() => removeMerge(i)} className="btn-ghost text-red-600 text-sm shrink-0">حذف</button>
                </div>
                <div className="mt-3 text-sm text-slate-600">ستون‌های مبدأ:</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {headers.map(h => (
                    <button type="button" key={h} onClick={() => toggleMergeFrom(i, h)}
                      className={`rounded-lg border px-3 py-1 text-xs transition ${m.from.includes(h) ? "bg-brand-600 text-white border-brand-600" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                      {h}
                    </button>
                  ))}
                </div>
                {m.from.length > 0 && <div className="mt-2 text-xs text-slate-500">ادغام: {m.from.join(" + ")} به {m.name || "؟"}</div>}
              </div>
            ))}
            {merges.length === 0 && <div className="muted text-sm">هنوز ادغامی اضافه نکردی.</div>}
          </div>
          {merges.length > 0 && <button type="button" onClick={applyMerges} disabled={busyMerge} className="btn-primary mt-4">{busyMerge ? "در حال اعمال..." : "اعمال ادغام‌ها"}</button>}
        </div>

        <div className="card p-6">
          <div className="font-bold mb-3">۳. پیش‌نمایش داده</div>
          {selectedColumns.length === 0 ? (
            <div className="rounded-xl bg-amber-50 text-amber-800 p-3 text-sm">هنوز هیچ ستونی را به یک فیلد اختصاص ندادی. بعد از انتخاب، ستون‌ها اینجا نمایش داده می‌شوند.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs"><thead className="bg-slate-50"><tr>{selectedColumns.map(h => <th key={h} className="px-2 py-2 text-right font-medium">{h}</th>)}</tr></thead>
                <tbody>{preview.map((row, i) => <tr key={i} className="border-t border-slate-100">{selectedColumns.map(h => <td key={h} className="px-2 py-2 text-right truncate max-w-[140px]">{String((row.raw as any)?.[h] ?? "")}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )}
        </div>

        {msg && <div className="rounded-xl bg-slate-100 p-3 text-sm">{msg}</div>}
        <div className="flex gap-3"><button onClick={saveMapping} disabled={busySave} className="btn-primary px-6 py-3">{busySave ? "در حال پردازش…" : "ذخیره نگاشت و مشاهده داشبورد"}</button></div>
      </div>
    </DndContext>
  );
}