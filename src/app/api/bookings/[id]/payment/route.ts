import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
const STORAGE_DIR = process.env.STORAGE_DIR || "./.storage";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"], ["application/pdf", ".pdf"]]);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking || booking.userId !== user.id) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (booking.status !== "accepted") return NextResponse.json({ error: "پرداخت فقط بعد از تایید مشاور ممکن است" }, { status: 400 });
  if (booking.paymentStatus !== "unpaid") return NextResponse.json({ error: "پرداخت قبلاً ثبت شده" }, { status: 400 });

  const form = await req.formData();
  const reference = String(form.get("reference") || "").trim();
  const file = form.get("receipt");
  if (reference.length < 3) return NextResponse.json({ error: "شماره پیگیری را وارد کنید" }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "فایل رسید را بارگذاری کنید" }, { status: 400 });
  if (file.size === 0 || file.size > MAX_SIZE) return NextResponse.json({ error: "حجم رسید باید حداکثر ۵ مگابایت باشد" }, { status: 400 });
  const ext = ALLOWED.get(file.type);
  if (!ext) return NextResponse.json({ error: "فرمت رسید باید JPG، PNG، WEBP یا PDF باشد" }, { status: 400 });

  await fs.mkdir(STORAGE_DIR, { recursive: true });
  const storedName = `booking-payment-${booking.id}-${Date.now()}${ext}`;
  await fs.writeFile(path.join(STORAGE_DIR, storedName), Buffer.from(await file.arrayBuffer()));
  await db.booking.update({ where: { id }, data: { paymentStatus: "pending_review" } });
  await db.message.create({ data: { bookingId: id, senderId: user.id, text: `💳 اعلام پرداخت | reference:${reference.slice(0, 100)} | proof:${storedName}` } });
  return NextResponse.json({ ok: true });
}
