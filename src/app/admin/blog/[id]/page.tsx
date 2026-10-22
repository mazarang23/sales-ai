import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { BlogEditor } from "@/components/admin/BlogEditor";

export const dynamic = "force-dynamic";

export default async function AdminBlogEdit({ params }: { params: { id: string } }) {
  if (params.id === "new") {
    return (
      <div className="space-y-4">
        <h1 className="h2">مقاله جدید</h1>
        <BlogEditor initial={{ id: "", title: "", slug: "", excerpt: "", body: "", published: false }} />
      </div>
    );
  }
  const post = await db.blogPost.findUnique({ where: { id: params.id } });
  if (!post) notFound();
  return (
    <div className="space-y-4">
      <h1 className="h2">ویرایش مقاله</h1>
      <BlogEditor initial={{ id: post.id, title: post.title, slug: post.slug, excerpt: post.excerpt, body: post.body, published: post.published }} />
    </div>
  );
}