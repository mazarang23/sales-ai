import { redirect } from "next/navigation";
import { getCurrentConsultant } from "@/lib/consultant-auth";
import { AvailabilityEditor } from "@/components/consultant/AvailabilityEditor";
import Link from "next/link";

export const dynamic = "force-dynamic";
export default async function ConsultantAvailabilityPage() {
  const consultant = await getCurrentConsultant();
  if (!consultant) redirect("/consultant/login");
  return <div className="container-tight py-10 space-y-6" dir="rtl"><div className="flex items-center justify-between"><div><h1 className="h2">تقویم و ساعات کاری</h1><p className="muted mt-1 text-sm">زمان‌هایی را که مشتری می‌تواند برای جلسه درخواست بدهد مشخص کن.</p></div><Link href="/consultant/dashboard" className="btn-ghost text-sm">بازگشت</Link></div><AvailabilityEditor /></div>;
}
