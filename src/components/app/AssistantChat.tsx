"use client";
import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export function AssistantChat({ uploadId }: { uploadId?: string }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function ask() {
    if (!question.trim() || busy) return;
    const q = question;
    setQuestion("");
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setBusy(true);
    setError(null);

    try {
      const r = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, uploadId })
      });

      const text = await r.text();
      if (!text) throw new Error("پاسخی از سرور دریافت نشد.");

      let j: any;
      try {
        j = JSON.parse(text);
      } catch {
        throw new Error("پاسخ سرور معتبر نبود.");
      }

      if (!r.ok) {
        if (j.error === "LIMIT_REACHED") {
          setError(j.message);
        } else {
          throw new Error(j.error || "خطا");
        }
        return;
      }

      setMessages(prev => [...prev, { role: "assistant", content: j.answer }]);
      setRemaining(j.remaining);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-6 space-y-4">
      <div>
        <div className="font-bold">دستیار هوشمند</div>
        <div className="muted text-sm mt-1">
          درباره داده‌ها یا اقدامات رشد سوال بپرس. پاسخ‌ها بر اساس داده‌های همین آپلود است.
        </div>
      </div>

      {messages.length > 0 && (
        <div
          ref={scrollRef}
          className="max-h-96 overflow-y-auto space-y-3 rounded-xl bg-slate-50 p-4"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 text-sm leading-7 whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-brand-600 text-white ml-auto max-w-[80%]"
                  : "bg-white border border-slate-200 max-w-[90%]"
              }`}
            >
              {m.content}
            </div>
          ))}
          {busy && (
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-500 max-w-[90%]">
              در حال فکر کردن...
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-amber-50 text-amber-800 p-3 text-sm">
          {error}
          <a href="/pricing" className="block mt-2 text-brand-600 font-medium">
            مشاهده پلن‌ها ←
          </a>
        </div>
      )}

      <div className="flex gap-2">
        <input
          className="input flex-1"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="مثلاً: چطور فروش را ۲۰٪ افزایش بدهم؟"
          onKeyDown={e => e.key === "Enter" && ask()}
          disabled={busy}
        />
        <button onClick={ask} disabled={busy || !question.trim()} className="btn-primary">
          {busy ? "..." : "بپرس"}
        </button>
      </div>

      {remaining !== null && (
        <div className="text-xs text-slate-500">
          {remaining > 0 ? `${remaining} سوال رایگان باقی مانده` : "سوال رایگان تمام شد"}
        </div>
      )}
    </div>
  );
}