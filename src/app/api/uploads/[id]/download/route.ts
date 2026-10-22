import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const STORAGE_DIR = path.resolve(
  process.env.STORAGE_DIR || path.join(process.cwd(), ".storage")
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const where = user.role === "ADMIN"
    ? { id }
    : { id, userId: user.id };

  const upload = await db.upload.findFirst({ where });

  if (!upload) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (!upload.fileKey || upload.fileKey === "inline") {
    return NextResponse.json(
      { error: "فایل اصلی این آپلود روی سرور ذخیره نشده است" },
      { status: 404 }
    );
  }

  const filePath = path.join(STORAGE_DIR, path.basename(upload.fileKey));

  try {
    const data = await fs.readFile(filePath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(upload.fileName)}"`
      }
    });
  } catch (e: any) {
    console.error("download error:", e);
    if (e?.code === "ENOENT") {
      return NextResponse.json(
        { error: "فایل روی فضای ذخیره‌سازی پیدا نشد. برای فایل‌های قدیمی، فایل باید دوباره آپلود شود." },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: "خطا در دریافت فایل" }, { status: 500 });
  }
}