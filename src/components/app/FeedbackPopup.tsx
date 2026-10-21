"use client";
import { useEffect, useState } from "react";

export function FeedbackPopup({
  uploadId,
  feedbackGiven
}: {
  uploadId: string;
  feedbackGiven: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (feedbackGiven) return;
    if (typeof window === "undefined") return;
    const t = setTimeout(() => setOpen(true), 30 * 1000);
    return () => clearTimeout(t);
  }, [feedbackGiven]);

  async function submit() {
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text, uploadId })
      });
    } catch {}
    setSent(true);
    setTimeout(() => setOpen(false), 1500);
  }

  if (!open || sent) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4" dir="rtl">
        <div className="font-bold">تحلیل چطور بود؟</div>
        <p className="muted text-sm">این بازخورد به بهتر شدن محصول کمک می‌کند.</p>
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={`h-10 w-10 rounded-full border ${
                rating >= n
                  ? "bg-brand-600 text-white border-brand-600"
                  : "border-slate-200"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <textarea
          className="input h-20"
          placeholder="چه چیزی خوب بود؟ چه چیزی نه؟"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="flex gap-2">
          <button onClick={submit} disabled={!rating} className="btn-primary">
            ارسال
          </button>
          <button onClick={() => setOpen(false)} className="btn-ghost">
            بعداً
          </button>
        </div>
      </div>
    </div>
  );
}