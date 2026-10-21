"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    if (!rating) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch(`/api/bookings/${bookingId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "خطا");
      setMsg("امتیاز شما ثبت شد. ممنون!");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-6 space-y-3">
      <div className="font-bold">امتیاز به این جلسه</div>
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
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="نظرت درباره جلسه (اختیاری)"
      />
      {msg && <div className="rounded-xl bg-slate-100 p-2 text-sm">{msg}</div>}
      <button onClick={submit} disabled={busy || !rating} className="btn-primary w-full">
        {busy ? "..." : "ثبت امتیاز"}
      </button>
    </div>
  );
}