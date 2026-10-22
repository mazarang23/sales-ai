"use client";
import { useEffect, useRef, useState } from "react";

type Msg = { id: string; senderId: string; text: string; createdAt: string };

export function ChatBox({
  bookingId,
  mySenderId,
  role,
  disabled
}: {
  bookingId: string;
  mySenderId: string;
  role: "user" | "consultant";
  disabled?: boolean;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const r = await fetch(`/api/bookings/${bookingId}/messages`);
      if (!r.ok) return;
      const j = await r.json();
      setMessages(j.messages || []);
    } catch {}
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [bookingId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function send() {
    if (!text.trim() || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/bookings/${bookingId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      setText("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  }

  // رنگ‌ها بر اساس نقش
  const myBubbleClass =
    role === "consultant"
      ? "bg-emerald-600 text-white border border-emerald-700 ml-auto rounded-tr-md"
      : "bg-brand-600 text-white border border-brand-700 ml-auto rounded-tr-md";

  const otherBubbleClass =
    role === "consultant"
      ? "bg-white text-slate-800 border border-slate-200 mr-auto rounded-tl-md"
      : "bg-white text-slate-800 border border-slate-200 mr-auto rounded-tl-md";

  return (
    <div className="card p-4 space-y-3">
      <div
        ref={scrollRef}
        className="max-h-96 overflow-y-auto space-y-3 rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4"
      >
        {messages.length === 0 && (
          <div className="muted text-sm text-center py-4">هنوز پیامی نیست.</div>
        )}
        {messages.map(m => {
          const mine = m.senderId === mySenderId;
          return (
            <div
              key={m.id}
              className={`rounded-2xl p-3 text-sm leading-7 max-w-[88%] shadow-sm ${
                mine ? myBubbleClass : otherBubbleClass
              }`}
            >
              {m.text}
            </div>
          );
        })}
      </div>
      {err && <div className="text-xs text-red-600">{err}</div>}
      <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <input
          className="input flex-1 border-0 shadow-none focus:ring-0"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={disabled ? "چت غیرفعال است" : "پیامت را بنویس..."}
          onKeyDown={e => e.key === "Enter" && !disabled && send()}
          disabled={disabled || busy}
        />
        <button
          onClick={send}
          disabled={disabled || busy || !text.trim()}
          className="btn-primary"
        >
          {busy ? "در حال ارسال…" : "ارسال پیام"}
        </button>
      </div>
    </div>
  );
}