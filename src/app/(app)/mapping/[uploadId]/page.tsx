"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const FIELDS = [
  { key: "customer", label: "نام مشتری" },
  { key: "product", label: "نام محصول" },
  { key: "amount", label: "مبلغ فروش" },
  { key: "quantity", label: "تعداد" },
  { key: "date", label: "تاریخ فروش" },
  { key: "orderId", label: "شماره سفارش" }
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

export default function MappingPage() {
  const params = useParams<{ uploadId: string }>();
  const router = useRouter();
  const uploadId = params.uploadId;
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMap, setFieldMap] = useState<Partial<Record<FieldKey, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/uploads/${uploadId}/mapping`)
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "دریافت اطلاعات فایل ناموفق بود");
        setFileName(data.fileName);
        setHeaders(Array.isArray(data.headers) ? data.headers : []);
        setFieldMap(data.fieldMap || {});
      })
      .catch(e => setError(e instanceof Error ? e.message : "خطا در دریافت اطلاعات"))
      .finally(() => setLoading(false));
  }, [uploadId]);

  async function save() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/uploads/${uploadId}/mapping`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldMap })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ذخیره نگاشت ستون‌ها ناموفق بود");
      router.push(data.redirectTo || `/dashboard/${uploadId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در ذخیره");
      setSaving(false);
    }
  }

  if (loading) return <div className="container-tight py-10" dir="rtl">در حال بارگذاری ستون‌ها...</div>;

  return (
    <div className="container-tight max-w-3xl py-10" dir="rtl">
      <Link href="/dashboard" className="text-sm text-slate-500 hover:text-brand-600">← بازگشت به فایل‌ها</Link>
      <h1 className="h2 mt-4">تطبیق ستون‌های فایل</h1>
      <p className="muted mt-2">برای اینکه تحلیل دقیق باشد، مشخص کنید هر ستون فایل چه معنایی دارد.</p>
      {fileName && <p className="mt-3 text-sm font-medium">{fileName}</p>}

      {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="card mt-6 space-y-4 p-5">
        {FIELDS.map(field => (
          <div key={field.key} className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-center">
            <label htmlFor={field.key} className="text-sm font-medium">{field.label}</label>
            <select
              id={field.key}
              className="input"
              value={fieldMap[field.key] || ""}
              onChange={e => setFieldMap(current => ({ ...current, [field.key]: e.target.value }))}
            >
              <option value="">— انتخاب نشده —</option>
              {headers.map(header => <option key={header} value={header}>{header}</option>)}
            </select>
          </div>
        ))}
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" className="btn-primary" disabled={saving} onClick={save}>
            {saving ? "در حال ذخیره..." : "ذخیره و شروع تحلیل"}
          </button>
          <Link href="/dashboard" className="btn-ghost">بعداً انجام می‌دهم</Link>
        </div>
      </div>
    </div>
  );
}
