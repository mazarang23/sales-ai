import { redirect } from "next/navigation";
import { getCurrentConsultant } from "@/lib/consultant-auth";
import { PhoneVerificationForm } from "@/components/app/PhoneVerificationForm";
export const dynamic = "force-dynamic";
export default async function ConsultantCompleteProfilePage(){const consultant=await getCurrentConsultant();if(!consultant)redirect("/consultant/login");if(consultant.phone&&consultant.userId)redirect("/consultant/dashboard");return <main className="container-tight mx-auto max-w-lg py-14" dir="rtl"><div className="mb-6"><div className="text-xs font-semibold text-brand-700">تکمیل حساب مشاور</div><h1 className="h2 mt-2">شماره موبایلت را وارد کن</h1><p className="muted mt-2 leading-7">برای تکمیل پروفایل، شماره موبایل را وارد کن. می‌توانی فعلاً بدون پیامک ادامه بدهی؛ برای اتصال امن حساب‌ها و تأیید مالکیت شماره، بعداً OTP لازم است.</p></div><PhoneVerificationForm kind="consultant" /></main>}
