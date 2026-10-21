import { RegisterForm } from "@/components/app/RegisterForm";

export const metadata = { title: "ثبت‌نام" };

export default function RegisterPage() {
  return (
    <div className="container-tight py-16 max-w-md mx-auto" dir="rtl">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs text-brand-700">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-600" />
          رایگان، بدون کارت بانکی
        </div>
        <h1 className="h2 mt-4">حساب کاربری بساز</h1>
        <p className="muted mt-2 text-sm leading-6">
          با ثبت‌نام، فایل اکسل فروش را آپلود کن، تحلیل هوشمند بگیر،
          و اگر خواستی با مشاورین خبره جلسه بگذار.
        </p>
      </div>
      <div className="mt-8">
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-xs text-slate-500 leading-6">
        مشاور رشد هستی؟{" "}
        <a href="/consultant/register" className="text-brand-600 font-medium">
          ثبت‌نام مشاور
        </a>
      </p>
    </div>
  );
}