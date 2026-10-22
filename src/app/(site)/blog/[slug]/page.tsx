import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BlogBody } from "@/components/site/BlogBody";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await db.blogPost.findUnique({ where: { slug, published: true } });
  return p ? { title: p.title, description: p.excerpt } : { title: "مقاله" };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await db.blogPost.findUnique({ where: { slug, published: true } });
  if (!p) notFound();
  return (
    <article className="container-tight py-16 max-w-3xl" dir="rtl">
      <div className="text-xs text-brand-700">
        {new Date(p.createdAt).toLocaleDateString("fa-IR")}
      </div>
      <h1 className="h1 mt-2">{p.title}</h1>
      <p className="muted mt-4 text-lg">{p.excerpt}</p>
      <BlogBody body={p.body} />
    </article>
  );
}