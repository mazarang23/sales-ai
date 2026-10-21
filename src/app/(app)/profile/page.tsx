import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/app/ProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "پروفایل" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <div className="container-tight py-10 max-w-md" dir="rtl">
      <h1 className="h2">پروفایل</h1>
      <p className="muted mt-2">اطلاعات حسابت را ویرایش کن.</p>
      <div className="mt-8">
        <ProfileForm
          initial={{
            name: user.name || "",
            industry: user.industry || "",
            phone: user.phone
          }}
        />
      </div>
    </div>
  );
}