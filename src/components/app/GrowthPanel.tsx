"use client";
import { useState } from "react";

type Action = {
  title: string;
  cost: string;
  eta: string;
  impact: string;
  reasoning?: string;
};

type Explanation = {
  details: string;
  steps: string[];
};

export function GrowthPanel({
  uploadId,
  existingRecommendation
}: {
  uploadId: string;
  existingRecommendation?: Action[] | null;
}) {
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState<Action[] | null>(existingRecommendation || null);
  const [source, setSource] = useState<"ai" | "fallback" | null>(existingRecommendation ? "ai" : null);
  const [err, setErr] = useState<string | null>(null);
  const [hasExisting] = useState(!!existingRecommendation);

  const [explainingIndex, setExplainingIndex] = useState<number | null>(null);
  const [explanations, setExplanations] = useState<Record<number, Explanation>>({});
  const [explainErr, setExplainErr] = useState<string | null>(null);
  const [explainBusy, setExplainBusy] = useState<number | null>(null);

  async function run() {
    if (hasExisting && !confirm("تحلیل جدید انجام شود؟")) return;
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/ai/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId })
      });
      const text = await r.text();
      if (!text) throw new Error("پاسخ سرور خالی بود");
      const j = JSON.parse(text);
      if (!r.ok) throw new Error(j.error || "خطا");
      setActions(j.actions);
      setSource(j.source);
      setExplanations({});
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  async function explain(i: number) {
    if (!actions) return;
    const a = actions[i];
    setExplainBusy(i);
    setExplainErr(null);
    setExplainingIndex(i);
    try {
      const r = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, action: a })
      });
      const text = await r.text();
      if (!text) throw new Error("پاسخ سرور خالی بود");
      const j = JSON.parse(text);
      if (!r.ok) {
        if (j.error === "LIMIT_REACHED") {
          setExplainErr(j.message);
        } else {
          throw new Error(j.error || "خطا");
        }
        return;
      }
      setExplanations(prev => ({ ...prev, [i]: j.explanation }));
    } catch (e) {
      setExplainErr(e instanceof Error ? e.message : "خطا");
    } finally {
      setExplainBusy(null);
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-bold">مشاور رشد هوشمند</div>
          <div className="muted text-sm mt-1">
            {actions ? "برنامه رشد بر اساس داده‌های این آپلود" : "پیشنهاد اقدام فوری"}
          </div>
        </div>
        <button onClick={run} disabled={loading} className={actions ? "btn-ghost" : "btn-primary"}>
          {loading ? "در حال تحلیل..." : actions ? "تحلیل جدید" : "دریافت برنامه رشد"}
        </button>
      </div>

      {source === "fallback" && actions && (
        <div className="mt-4 rounded-xl bg-amber-50 text-amber-800 p-3 text-sm">
          ⚠️ سرویس AI در دسترس نبود؛ پیشنهادهای نمونه نمایش داده می‌شود.
        </div>
      )}

      {err && <div className="mt-4 rounded-xl bg-red-50 text-red-700 p-3 text-sm">{err}</div>}

      {actions && (
        <div className="mt-6 space-y-3">
          {actions.map((a, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold">{a.title}</div>
                <button
                  onClick={() => explain(i)}
                  disabled={explainBusy === i}
                  className="btn-ghost text-xs shrink-0"
                >
                  {explainBusy === i ? "..." : "توضیح بیشتر"}
                </button>
              </div>
              {a.reasoning && (
                <div className="mt-2 text-sm text-slate-600 leading-6">دلیل: {a.reasoning}</div>
              )}
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-slate-500">هزینه</div>
                  <div className="font-medium mt-1">{a.cost}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-slate-500">زمان</div>
                  <div className="font-medium mt-1">{a.eta}</div>
                </div>
                <div className="rounded-lg bg-emerald-50 p-2">
                  <div className="text-emerald-700">اثر</div>
                  <div className="font-medium mt-1">{a.impact}</div>
                </div>
              </div>

              {explainingIndex === i && (
                <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm leading-7">
                  {explainBusy === i && <div className="muted">در حال تولید توضیح...</div>}
                  {explanations[i] && (
                    <>
                      <div className="whitespace-pre-wrap">{explanations[i].details}</div>
                      {explanations[i].steps.length > 0 && (
                        <div className="mt-3">
                          <div className="font-medium mb-2">گام‌های عملیاتی:</div>
                          <ol className="list-decimal list-inside space-y-1">
                            {explanations[i].steps.map((s, k) => (
                              <li key={k}>{s}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </>
                  )}
                  {explainErr && (
                    <div className="rounded-xl bg-amber-50 text-amber-800 p-2 mt-2">
                      {explainErr}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}