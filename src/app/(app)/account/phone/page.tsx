import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppNav } from "@/components/app/AppNav";
import { PhoneVerificationForm } from "@/components/app/PhoneVerificationForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "تغییر شماره تلفن" };

export default async function AccountPhonePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <>
    <AppNav current="dashboard" />
    <main className="container-tight mx-auto max-w-lg py-10" dir="rtl">
      <Link href="/dashboard" className="text-sm text-brand-700 underline">بازگشت به داشبورد</Link>
      <h1 className="h2 mt-4">تغییر شماره تلفن</h1>
      <p className="muted mt-2 mb-6 leading-7">برای تغییر شماره، کد یک‌بارمصرف به شماره جدید ارسال می‌شود. شماره قبلی تا زمان تأیید شماره جدید حفظ نمی‌شود؟ خیر؛ شماره جدید فقط پس از تأیید ثبت خواهد شد.</p>
      <PhoneVerificationForm kind="customer" allowUnverified={false} />
    </main>
  </>;
}
