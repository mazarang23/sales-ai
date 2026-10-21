import { LoginForm } from "@/components/app/LoginForm";

export const metadata = { title: "ورود" };

export default function LoginPage() {
  return (
    <div className="container-tight py-16 max-w-md mx-auto" dir="rtl">
      <h1 className="h2 text-center">ورود به حساب</h1>
      <p className="muted mt-2 text-center">شماره و رمز عبورت را وارد کن.</p>
      <div className="mt-8"><LoginForm /></div>
    </div>
  );
}