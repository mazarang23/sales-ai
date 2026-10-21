"use client";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-tight py-16 max-w-md text-center" dir="rtl">
      <h1 className="h2">خطایی رخ داد</h1>
      <p className="muted mt-3 text-sm">
        {error.message || "مشکلی پیش آمد. لطفاً دوباره تلاش کنید."}
      </p>
      <div className="mt-6 flex gap-3 justify-center">
        <button onClick={reset} className="btn-primary">
          تلاش مجدد
        </button>
        <a href="/dashboard" className="btn-ghost">
          بازگشت به داشبورد
        </a>
      </div>
    </div>
  );
}