import { BlogEditor } from "@/components/admin/BlogEditor";

export const dynamic = "force-dynamic";

export default function AdminBlogNew() {
  return (
    <div className="space-y-4">
      <h1 className="h2">مقاله جدید</h1>
      <BlogEditor
        initial={{ id: "", title: "", slug: "", excerpt: "", body: "", published: false }}
      />
    </div>
  );
}