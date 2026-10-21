"use client";
import { useEffect, useState } from "react";

type Msg = { id: string; role: string; content: string; createdAt: string };

export function ChatHistory({ uploadId }: { uploadId: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/assistant/history?uploadId=${uploadId}`)
      .then(r => r.json())
      .then(j => setMessages(j.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [uploadId]);

  if (loading) return <div className="muted text-sm">در حال بارگذاری...</div>;
  if (messages.length === 0)
    return <div className="muted text-sm">هنوز مکالمه‌ای نداری.</div>;

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {messages.map(m => (
        <div
          key={m.id}
          className={`rounded-xl p-3 text-sm leading-6 max-w-[85%] ${
            m.role === "user"
              ? "bg-brand-600 text-white ml-auto"
              : "bg-white border border-slate-200"
          }`}
        >
          {m.content}
        </div>
      ))}
    </div>
  );
}