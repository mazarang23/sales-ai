"use client";
import { useEffect, useRef, useState } from "react";

type Item = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const r = await fetch("/api/notifications");
      if (!r.ok) return;
      const j = await r.json();
      setItems(j.items || []);
      setUnread(j.unread || 0);
    } catch {}
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000); // هر ۱۵ ثانیه
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function markAllRead() {
    const ids = items.filter(i => !i.readAt).map(i => i.id);
    if (ids.length === 0) return;
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids })
    });
    load();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen(o => !o);
          if (!open) markAllRead();
        }}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100"
        aria-label="اعلانات"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-red-500 text-[10px] text-white grid place-items-center px-1">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-80 max-h-96 overflow-y-auto card p-2 z-50" dir="rtl">
          {items.length === 0 ? (
            <div className="p-4 text-center muted text-sm">اعلانی نیست.</div>
          ) : (
            <div className="space-y-1">
              {items.map(i => (
                <a
                  key={i.id}
                  href={i.link || "#"}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg p-3 text-sm hover:bg-slate-50 ${
                    !i.readAt ? "bg-brand-50/50" : ""
                  }`}
                >
                  <div className="font-medium">{i.title}</div>
                  <div className="text-xs text-slate-600 mt-1 leading-5">{i.body}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {new Date(i.createdAt).toLocaleString("fa-IR")}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}