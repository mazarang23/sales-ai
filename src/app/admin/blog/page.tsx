import Link from "next/link";
import { db } from "@/lib/db";
import { ImportNotionBlogButton } from "@/components/admin/ImportNotionBlogButton";

export const dynamic = "force-dynamic";

export default async function AdminBlogList() {
  const posts = await db.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="h2">مقالات وبلاگ</h1>
          <p className="muted mt-1 text-sm">ایجاد، ویرایش، انتشار و حذف مقالات</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <ImportNotionBlogButton />
          <Link href="/admin/blog/new" className="btn-primary text-sm">مقاله جدید</Link>
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs"><tr><th className="px-3 py-3 text-right">عنوان</th><th className="px-3 py-3 text-right">slug</th><th className="px-3 py-3 text-right">وضعیت</th><th className="px-3 py-3 text-right">عملیات</th></tr></thead>
          <tbody>
            {posts.map(p => <tr key={p.id} className="border-t border-slate-100"><td className="px-3 py-2">{p.title}</td><td className="px-3 py-2 font-mono text-xs">{p.slug}</td><td className="px-3 py-2">{p.published ? <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">منتشر شده</span> : <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">پیش‌نویس</span>}</td><td className="px-3 py-2 text-left"><Link href={`/admin/blog/${p.id}`} className="text-brand-600">ویرایش</Link></td></tr>)}
            {posts.length === 0 && <tr><td colSpan={4} className="p-6 text-center muted">مقاله‌ای نیست</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
