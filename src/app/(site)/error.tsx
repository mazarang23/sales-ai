"use client";

export default function SiteError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-tight py-24 max-w-md text-center" dir="rtl">
      <h1 className="h2">خطایی رخ داد</h1>
      <p className="muted mt-3 text-sm">{error.message || "مشکلی پیش آمد"}</p>
      <button onClick={reset} className="btn-primary mt-6">تلاش مجدد</button>
    </div>
  );
}