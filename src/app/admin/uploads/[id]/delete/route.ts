import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const STORAGE_DIR = process.env.STORAGE_DIR || "./.storage";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const upload = await db.upload.findFirst({
    where: { id: params.id, userId: user.id }
  });
  if (!upload) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  try { await fs.unlink(path.join(STORAGE_DIR, upload.fileKey)); } catch {}

  await db.upload.delete({ where: { id: upload.id } });
  return NextResponse.json({ ok: true });
}