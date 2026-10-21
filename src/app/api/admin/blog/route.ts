import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function guard() {
  const u = await getCurrentUser();
  if (!u || u.role !== "ADMIN") return null;
  return u;
}

export async function POST(req: NextRequest) {
  if (!(await guard())) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const b = await req.json();
  if (b.id) {
    const p = await db.blogPost.update({
      where: { id: b.id },
      data: { title: b.title, slug: b.slug, excerpt: b.excerpt, body: b.body, published: !!b.published }
    });
    return NextResponse.json({ ok: true, id: p.id });
  }
  const p = await db.blogPost.create({
    data: { title: b.title, slug: b.slug, excerpt: b.excerpt, body: b.body, published: !!b.published }
  });
  return NextResponse.json({ ok: true, id: p.id });
}

export async function DELETE(req: NextRequest) {
  if (!(await guard())) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  await db.blogPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}