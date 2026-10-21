import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { db } from "@/lib/db";
import { getCurrentConsultant } from "@/lib/consultant-auth";

export const runtime = "nodejs";

const STORAGE_DIR = path.join(
    process.env.STORAGE_DIR || "./.storage",
    "consultants"
  );

async function ensureDir() {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  const consultant = await getCurrentConsultant();
  if (!consultant) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("photo") as File | null;
  if (!file) {
    return NextResponse.json({ error: "عکسی انتخاب نشده" }, { status: 400 });
  }

  // محدودیت ۲ مگابایت
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "حجم عکس حداکثر ۲ مگابایت" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
    return NextResponse.json(
      { error: "فرمت باید jpg، png یا webp باشد" },
      { status: 400 }
    );
  }

  await ensureDir();
  const fileName = `${consultant.id}-${Date.now()}${ext}`;
  const filePath = path.join(STORAGE_DIR, fileName);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buf);

  const publicUrl = `/api/consultants/photo/${fileName}`;

  await db.consultant.update({
    where: { id: consultant.id },
    data: { photoUrl: publicUrl }
  });

  return NextResponse.json({ ok: true, photoUrl: publicUrl });
}