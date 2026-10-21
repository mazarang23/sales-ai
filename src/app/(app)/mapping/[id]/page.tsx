import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MappingEditor } from "@/components/app/MappingEditor";
import { BackButton } from "@/components/app/BackButton";
import { AppNav } from "@/components/app/AppNav";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MappingPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const upload = await db.upload.findFirst({
    where: { id, userId: user.id },
    include: { mappings: true }
  });
  if (!upload || !upload.mappings) notFound();

  const headers = (upload.mappings.headers as string[]) || [];
  const fieldMap = (upload.mappings.fieldMap as Record<string, string>) || {};
  const merges = ((upload.mappings.mergedColumns as any[]) || []).map((m: any) => ({
    name: m.name,
    from: m.from || []
  }));

  const preview = await db.dataRow.findMany({
    where: { uploadId: upload.id },
    take: 5
  });

  return (
    <>
      <AppNav current="dashboard" />
      <div className="container-tight py-10 max-w-5xl" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <BackButton href="/dashboard" label="بازگشت به داشبورد" />
          <Link href="/upload" className="btn-ghost text-sm">
            آپلود فایل جدید
          </Link>
        </div>

        <h1 className="h2">تنظیم ستون‌ها</h1>
        <p className="muted mt-2">
          نگاشت، واحد پول، و ادغام ستون‌ها را تنظیم کن. بعد از ذخیره، به داشبورد می‌روی.
        </p>

        <div className="mt-8">
          <MappingEditor
            uploadId={upload.id}
            initialHeaders={headers}
            initialFieldMap={fieldMap}
            initialMerges={merges}
            preview={preview}
          />
        </div>
      </div>
    </>
  );
}