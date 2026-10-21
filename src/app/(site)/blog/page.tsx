import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "وبلاگ" };
export const dynamic = "force-dynamic";

export default async function BlogList() {
  const posts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" }
  });
  return (
    <section className="container-tight py-16">
      <h1 className="h1">وبلاگ</h1>
      <p className="muted mt-3">مقالات تحلیل داده و رشد فروش.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.length === 0 && <div className="muted">هنوز مقاله‌ای منتشر نشده.</div>}
        {posts.map(p => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="card p-6 hover:shadow-glow transition">
            <div className="text-xs text-brand-700">{new Date(p.createdAt).toLocaleDateString("fa-IR")}</div>
            <div className="mt-2 font-bold text-lg leading-7">{p.title}</div>
            <p className="muted mt-2 text-sm leading-6 line-clamp-3">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}