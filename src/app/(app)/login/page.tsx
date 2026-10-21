import { OtpForm } from "@/components/app/OtpForm";

export const metadata = { title: "ورود" };

export default function LoginPage() {
  return (
    <div className="container-tight py-16 max-w-md mx-auto" dir="rtl">
      <h1 className="h2 text-center">ورود</h1>
      <p className="muted mt-2 text-center">
        شماره‌ات را وارد کن. کد تایید برایت پیامک می‌شود.
      </p>
      <div className="mt-8">
        <OtpForm mode="login" />
      </div>
      <p className="mt-4 text-sm text-slate-500 text-center">
        حساب نداری؟{" "}
        <a href="/register" className="text-brand-600">ثبت‌نام کن</a>
      </p>
    </div>
  );
}