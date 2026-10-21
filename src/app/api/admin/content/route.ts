import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const body = await req.json();
  const { id, key, type, value } = body;
  if (!id) {
    await db.siteContent.upsert({
      where: { key },
      update: { type, value },
      create: { key, type, value }
    });
  } else {
    await db.siteContent.update({ where: { id }, data: { value } });
  }
  return NextResponse.json({ ok: true });
}