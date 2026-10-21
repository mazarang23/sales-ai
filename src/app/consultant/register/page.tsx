import { getCurrentConsultant } from "@/lib/consultant-auth";
import { redirect } from "next/navigation";
import { ConsultantRegisterForm } from "@/components/consultant/ConsultantRegisterForm";
import { BackButton } from "@/components/app/BackButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ConsultantRegisterPage() {
  const existing = await getCurrentConsultant();
  if (existing) redirect("/consultant/dashboard");

  return (
    <div className="container-tight py-10 max-w-2xl" dir="rtl">
      <BackButton href="/" label="بازگشت به صفحه اصلی" />

      <h1 className="h2 mt-4">ثبت‌نام مشاور</h1>
      <p className="muted mt-2">
        پروفایل خود را تکمیل کن. بعد از تایید ادمین، در لیست مشاورین نمایش داده می‌شوی.
      </p>
      <div className="mt-8">
        <ConsultantRegisterForm />
      </div>
      <p className="mt-4 text-sm text-slate-500 text-center">
        قبلاً ثبت‌نام کردی؟{" "}
        <Link href="/consultant/login" className="text-brand-600">
          وارد شو
        </Link>
      </p>
    </div>
  );
}