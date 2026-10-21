import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json();
  const role = body.role;
  if (role !== "USER" && role !== "ADMIN") {
    return NextResponse.json({ error: "نقش نامعتبر" }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  // جلوگیری از حذف نقش آخرین ادمین
  if (target.role === "ADMIN" && role === "USER") {
    const adminCount = await db.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "نمی‌توان نقش آخرین ادمین را حذف کرد" },
        { status: 400 }
      );
    }
  }

  await db.user.update({ where: { id: params.id }, data: { role } });
  return NextResponse.json({ ok: true, role });
}