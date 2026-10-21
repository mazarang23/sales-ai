import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ImpersonateButton } from "@/components/admin/ImpersonateButton";

export const dynamic = "force-dynamic";

export default async function ImpersonatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") redirect("/login");
  
  const target = await db.user.findUnique({ where: { id } });
  if (!target) redirect("/admin/users");

  return (
    <div className="max-w-md mx-auto card p-6 space-y-4" dir="rtl">
      <h1 className="h2">ورود به پنل کاربر</h1>
      <p className="muted text-sm">
        با این کار، Session ادمین شما بسته و یک Session جدید به عنوان
        <span dir="ltr" className="font-mono mx-1">{target.phone}</span>
        باز می‌شود.
      </p>
      <ImpersonateButton userId={target.id} />
    </div>
  );
}