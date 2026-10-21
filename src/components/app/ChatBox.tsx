"use client";
import { useEffect, useRef, useState } from "react";

type Msg = { id: string; senderId: string; text: string; createdAt: string };

export function ChatBox({
  bookingId,
  mySenderId,
  disabled
}: {
  bookingId: string;
  mySenderId: string;
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

  return (
    <div className="card p-4 space-y-3">
      <div
        ref={scrollRef}
        className="max-h-80 overflow-y-auto space-y-2 rounded-xl bg-slate-50 p-3"
      >
        {messages.length === 0 && (
          <div className="muted text-sm text-center py-4">هنوز پیامی نیست.</div>
        )}
        {messages.map(m => {
          const mine = m.senderId === mySenderId;
          return (
            <div
              key={m.id}
              className={`rounded-xl p-2 text-sm leading-6 max-w-[85%] ${
                mine
                  ? "bg-brand-600 text-white ml-auto"
                  : "bg-white border border-slate-200"
              }`}
            >
              {m.text}
            </div>
          );
        })}
      </div>
      {err && <div className="text-xs text-red-600">{err}</div>}
      <div className="flex gap-2">
        <input
          className="input flex-1"
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
          {busy ? "..." : "ارسال"}
        </button>
      </div>
    </div>
  );
}