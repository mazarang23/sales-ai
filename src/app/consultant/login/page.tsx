import { getCurrentConsultant } from "@/lib/consultant-auth";
import { redirect } from "next/navigation";
import { ConsultantLoginForm } from "@/components/consultant/ConsultantLoginForm";

export const dynamic = "force-dynamic";

export default async function ConsultantLoginPage() {
  const existing = await getCurrentConsultant();
  if (existing) redirect("/consultant/dashboard");

  return (
    <div className="container-tight py-16 max-w-md" dir="rtl">
      <h1 className="h2">ورود مشاور</h1>
      <p className="muted mt-2">شماره و رمز عبور خود را وارد کن.</p>
      <div className="mt-8">
        <ConsultantLoginForm />
      </div>
      <p className="mt-4 text-sm text-slate-500 text-center">
        حساب نداری؟{" "}
        <a href="/consultant/register" className="text-brand-600">
          ثبت‌نام مشاور
        </a>
      </p>
    </div>
  );
}