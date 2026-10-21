import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const existing = await db.consultant.findUnique({ where: { userId: user.id } });
  if (existing) {
    return NextResponse.json({ error: "شما قبلاً درخواست مشاور داده‌اید" }, { status: 400 });
  }

  const body = await req.json();
  const { displayName, bio, photoUrl, linkedin, instagram, hourlyRate } = body;

  if (!displayName || String(displayName).trim().length < 3) {
    return NextResponse.json({ error: "نام نمایشی حداقل ۳ کاراکتر" }, { status: 400 });
  }
  if (!bio || String(bio).trim().length < 20) {
    return NextResponse.json({ error: "بیوگرافی حداقل ۲۰ کاراکتر" }, { status: 400 });
  }
  const rate = Number(hourlyRate);
  if (!rate || rate < 50000) {
    return NextResponse.json({ error: "تعرفه ساعتی حداقل ۵۰٬۰۰۰ تومان" }, { status: 400 });
  }

  const consultant = await db.consultant.create({
    data: {
      userId: user.id,
      displayName: String(displayName).slice(0, 100),
      bio: String(bio).slice(0, 2000),
      photoUrl: photoUrl ? String(photoUrl).slice(0, 500) : null,
      linkedin: linkedin ? String(linkedin).slice(0, 200) : null,
      instagram: instagram ? String(instagram).slice(0, 200) : null,
      hourlyRate: Math.round(rate),
      status: "pending"
    }
  });

  return NextResponse.json({ ok: true, id: consultant.id });
}