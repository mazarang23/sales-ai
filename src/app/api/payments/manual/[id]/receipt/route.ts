import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
const STORAGE_DIR = process.env.STORAGE_DIR || "./.storage";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["application/pdf", ".pdf"]
]);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const subscription = await db.subscription.findUnique({ where: { id } });
  if (!subscription || subscription.userId !== user.id) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (!["pending_payment", "pending", "rejected"].includes(subscription.status)) {
    return NextResponse.json({ error: "این پرداخت دیگر قابل ثبت نیست." }, { status: 400 });
  }

  const form = await req.formData();
  const reference = String(form.get("reference") || "").trim();
  const file = form.get("receipt");
  if (reference.length < 3) return NextResponse.json({ error: "شماره پیگیری را وارد کنید." }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "فایل رسید را بارگذاری کنید." }, { status: 400 });
  if (file.size === 0 || file.size > MAX_SIZE) return NextResponse.json({ error: "حجم رسید باید حداکثر ۵ مگابایت باشد." }, { status: 400 });
  const ext = ALLOWED.get(file.type);
  if (!ext) return NextResponse.json({ error: "فرمت رسید باید JPG، PNG، WEBP یا PDF باشد." }, { status: 400 });

  await fs.mkdir(STORAGE_DIR, { recursive: true });
  const storedName = `payment-${subscription.id}-${Date.now()}${ext}`;
  await fs.writeFile(path.join(STORAGE_DIR, storedName), Buffer.from(await file.arrayBuffer()));

  await db.subscription.update({
    where: { id },
    data: {
      status: "pending",
      authority: `manual:${reference.slice(0, 100)}`,
      refId: `proof:${storedName}`
    }
  });

  return NextResponse.json({ ok: true, status: "pending" });
}
