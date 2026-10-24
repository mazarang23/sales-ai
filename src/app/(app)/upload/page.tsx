import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UploadForm } from "@/components/app/UploadForm";
import { AppNav } from "@/components/app/AppNav";
import { PLANS, getPlan } from "@/lib/plans";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "آپلود اکسل" };

export default async function UploadPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const plan = PLANS[getPlan(user.plan)];
  const uploadedCount = await db.upload.count({ where: { userId: user.id } });

  return (
    <>
      <AppNav current="upload" />
      <div className="container-tight py-10 max-w-2xl" dir="rtl">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="h2">آپلود فایل فروش</h1>
            <p className="muted mt-2">فایل فروشگاهت را وارد کن تا الگوی فروش، مشتریان و فرصت‌های رشد را ببینی.</p>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm">
            <div className="font-bold">پلن {plan.label}</div>
            <div className="mt-1 text-xs text-slate-600">فایل‌ها: {uploadedCount.toLocaleString("fa-IR")} از {plan.maxUploads.toLocaleString("fa-IR")}</div>
            <div className="text-xs text-slate-600">هر فایل: حداکثر {plan.maxRows.toLocaleString("fa-IR")} ردیف</div>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          فرمت‌های XLSX، XLS و CSV پذیرفته می‌شوند؛ حداکثر حجم هر فایل ۱۰ مگابایت است و در حال حاضر فقط شیت اول خوانده می‌شود. می‌توانی داده‌های جدید را به یک آپلود قبلی اضافه کنی.
        </div>
        <div className="mt-6"><UploadForm /></div>
      </div>
    </>
  );
}
