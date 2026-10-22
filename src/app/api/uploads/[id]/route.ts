import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await context.params;
  let body: { displayName?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
  if (!displayName || displayName.length > 100) {
    return NextResponse.json({ error: "نام باید بین ۱ تا ۱۰۰ کاراکتر باشد" }, { status: 400 });
  }

  const ownedUpload = await db.upload.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!ownedUpload) return NextResponse.json({ error: "فایل پیدا نشد" }, { status: 404 });

  const upload = await db.upload.update({
    where: { id: ownedUpload.id },
    data: { displayName },
    select: { id: true, displayName: true }
  });
  return NextResponse.json({ ok: true, upload });
}
