import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UploadForm } from "@/components/app/UploadForm";
import { AppNav } from "@/components/app/AppNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "آپلود اکسل" };

export default async function UploadPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <AppNav current="upload" />
      <div className="container-tight py-10 max-w-2xl" dir="rtl">
        <h1 className="h2">آپلود فایل فروش</h1>
        <p className="muted mt-2">
          فرمت xlsx، xls یا csv. ما خودمان ستون‌ها را تشخیص می‌دهیم.
        </p>
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          محدودیت‌ها: حداکثر ۱۰ مگابایت، تا سقف پلن شما، فقط شیت اول خوانده می‌شود.
        </div>
        <div className="mt-6">
          <UploadForm />
        </div>
      </div>
    </>
  );
}