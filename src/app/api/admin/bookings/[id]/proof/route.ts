import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const STORAGE_DIR = process.env.STORAGE_DIR || "./.storage";
export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { id } = await params;
  const messages = await db.message.findMany({ where: { bookingId: id, text: { contains: "proof:" } }, orderBy: { createdAt: "desc" }, take: 1 });
  const marker = messages[0]?.text.match(/proof:([^\s|]+)/)?.[1];
  if (!marker) return NextResponse.json({ error: "رسیدی ثبت نشده" }, { status: 404 });
  const filename = path.basename(marker);
  try {
    const file = await fs.readFile(path.join(STORAGE_DIR, filename));
    const ext = path.extname(filename).toLowerCase();
    const contentType = ext === ".pdf" ? "application/pdf" : ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return new NextResponse(file, { headers: { "Content-Type": contentType, "Content-Disposition": "inline" } });
  } catch { return NextResponse.json({ error: "فایل رسید پیدا نشد" }, { status: 404 }); }
}
