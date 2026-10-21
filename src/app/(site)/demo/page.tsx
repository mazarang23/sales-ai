import { DemoDashboard } from "@/components/site/DemoDashboard";
import Link from "next/link";

export const metadata = { title: "دمو" };

export default function DemoPage() {
  return (
    <div className="container-tight py-12" dir="rtl">
      <div className="max-w-2xl">
        <h1 className="h1">دموی داشبورد</h1>
        <p className="muted mt-3 text-lg">
          این یک نمونه‌ی واقعی از تحلیل است. فایل اکسل خودت را آپلود کن تا اعداد فروشگاه خودت را ببینی.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/register" className="btn-primary px-6 py-3">
            شروع تحلیل رایگان
          </Link>
          <Link href="/" className="btn-ghost px-6 py-3">
            بازگشت
          </Link>
        </div>
      </div>
      <div className="mt-10">
        <DemoDashboard />
      </div>
    </div>
  );
}