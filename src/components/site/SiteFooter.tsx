import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white">
      <div className="container-tight grid gap-8 py-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="font-black text-lg">فروشیار AI</div>
          <p className="muted mt-3 text-sm leading-6">
            تحلیل هوشمند فروش فروشگاه‌های ایرانی. اکسل بده، رشد بگیر.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-3">محصول</div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href="/#features">ویژگی‌ها</Link></li>
            <li><Link href="/pricing">تعرفه</Link></li>
            <li><Link href="/demo">دمو</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">مشاورین</div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href="/#consultants">مشاورین برتر</Link></li>
            <li><Link href="/consultant/register">ثبت‌نام مشاور</Link></li>
            <li><Link href="/consultant/login">ورود مشاور</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">شرکت</div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href="/about">درباره ما</Link></li>
            <li><Link href="/blog">وبلاگ</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} فروشیار AI — همه حقوق محفوظ است.
      </div>
    </footer>
  );
}