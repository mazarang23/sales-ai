import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [users, leads, posts, uploads, recs] = await Promise.all([
    db.user.count(),
    db.lead.count(),
    db.blogPost.count(),
    db.upload.count(),
    db.recommendation.count()
  ]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="h2">داشبورد ادمین</h1>
        <p className="muted mt-1 text-sm">خلاصه‌ای از وضعیت سیستم</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card label="کاربران" value={users} href="/admin/users" />
        <Card label="لیدها" value={leads} href="/admin/leads" />
        <Card label="مقالات" value={posts} href="/admin/blog" />
        <Card label="آپلودها" value={uploads} href="#" />
        <Card label="توصیه‌های AI" value={recs} href="#" />
      </div>
    </div>
  );
}

function Card({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="card p-5 hover:shadow-glow transition">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-black">{value.toLocaleString("fa-IR")}</div>
    </Link>
  );
}