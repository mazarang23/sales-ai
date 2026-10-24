"use client";

import { useState } from "react";

export function CopyTextButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }
  return <button type="button" onClick={copy} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-brand-300 hover:text-brand-700">{copied ? "کپی شد" : "کپی"}</button>;
}
