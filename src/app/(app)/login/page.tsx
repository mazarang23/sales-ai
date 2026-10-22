
import { LoginForm } from "@/components/app/LoginForm";

export const metadata = { title: "ورود" };

export default function LoginPage() {
  return (
    <main className="container-tight mx-auto max-w-md py-16" dir="rtl">
      <h1 className="h2 text-center">ورود به حساب کاربری</h1>
      <p className="muted mt-2 text-center">
        شماره موبایل و رمز عبورت را وارد کن.
      </p>

      <div className="mt-8">
        <LoginForm />
      </div>

      <p className="mt-4 text-center text-sm text-slate-500">
        حساب کاربری نداری؟{" "}
        <a href="/register" className="text-brand-600">
          ثبت‌نام کن
        </a>
      </p>
    </main>
  );
}
