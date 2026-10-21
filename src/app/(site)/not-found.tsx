import Link from "next/link";

export default function SiteNotFound() {
  return (
    <div className="container-tight py-24 max-w-md text-center" dir="rtl">
      <h1 className="text-6xl font-black text-brand-600">۴۰۴</h1>
      <p className="muted mt-4">صفحه‌ای که دنبالش بودی پیدا نشد.</p>
      <Link href="/" className="btn-primary mt-6 inline-flex">بازگشت به خانه</Link>
    </div>
  );
}