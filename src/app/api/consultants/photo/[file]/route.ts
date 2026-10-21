import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

const STORAGE_DIR = path.join(
    process.env.STORAGE_DIR || "./.storage",
    "consultants"
  );

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  // جلوگیری از path traversal
  const safe = path.basename(file);
  const filePath = path.join(STORAGE_DIR, safe);
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(safe).toLowerCase();
    const contentType =
      ext === ".png" ? "image/png" :
      ext === ".webp" ? "image/webp" :
      "image/jpeg";
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
}