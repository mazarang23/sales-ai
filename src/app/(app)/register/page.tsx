import { RegisterForm } from "@/components/app/RegisterForm";

export const metadata = { title: "ثبت‌نام" };

export default function RegisterPage() {
  return (
    <div className="container-tight py-16 max-w-md mx-auto" dir="rtl">
      <h1 className="h2 text-center">ثبت‌نام</h1>
      <p className="muted mt-2 text-center">
        اطلاعاتت را وارد کن تا حساب کاربری‌ات ساخته شود.
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
      <p className="mt-4 text-sm text-slate-500 text-center">
        حساب داری؟{" "}
        <a href="/login" className="text-brand-600">وارد شو</a>
      </p>
    </div>
  );
}
