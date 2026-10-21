import Link from "next/link";
import { PricingCards } from "@/components/site/PricingCards";
import { FAQ } from "@/components/site/FAQ";

export const metadata = { title: "تعرفه" };

export default function PricingPage() {
  return (
    <>
      <section className="container-tight pt-16 pb-8 text-center">
        <h1 className="h1">تعرفه</h1>
        <p className="muted mt-3 max-w-2xl mx-auto">
          رایگان شروع کن. وقتی ارزش را دیدی، پلن رشد یا حرفه‌ای را فعال کن.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/register" className="btn-primary px-5 py-2.5">
            ثبت‌نام رایگان
          </Link>
          <Link href="/login" className="btn-ghost px-5 py-2.5">
            قبلاً ثبت‌نام کردی؟ وارد شو
          </Link>
        </div>
      </section>
      <PricingCards />
      <FAQ />
    </>
  );
}