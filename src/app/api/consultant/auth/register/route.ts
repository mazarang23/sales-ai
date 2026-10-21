import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  createConsultantSession,
  hashPassword
} from "@/lib/consultant-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      phone,
      password,
      displayName,
      bio,
      photoUrl,
      linkedin,
      instagram,
      hourlyRate
    } = body;

    if (!/^09\d{9}$/.test(String(phone || ""))) {
      return NextResponse.json({ error: "شماره موبایل معتبر نیست" }, { status: 400 });
    }
    if (!password || String(password).length < 6) {
      return NextResponse.json({ error: "رمز حداقل ۶ کاراکتر" }, { status: 400 });
    }
    if (!displayName || String(displayName).trim().length < 3) {
      return NextResponse.json({ error: "نام نمایشی حداقل ۳ کاراکتر" }, { status: 400 });
    }
    if (!bio || String(bio).trim().length < 20) {
      return NextResponse.json({ error: "بیوگرافی حداقل ۲۰ کاراکتر" }, { status: 400 });
    }
    const rate = Number(hourlyRate);
    if (!rate || rate < 50000) {
      return NextResponse.json({ error: "تعرفه حداقل ۵۰٬۰۰۰ تومان" }, { status: 400 });
    }

    const existing = await db.consultant.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json(
        { error: "این شماره قبلاً به عنوان مشاور ثبت‌نام کرده" },
        { status: 400 }
      );
    }

    // اگر کاربر عادی با همین شماره وجود دارد، لینک کن
    const linkedUser = await db.user.findUnique({ where: { phone } });

    const consultant = await db.consultant.create({
      data: {
        phone: String(phone),
        password: hashPassword(String(password)),
        displayName: String(displayName).slice(0, 100),
        bio: String(bio).slice(0, 2000),
        photoUrl: photoUrl ? String(photoUrl).slice(0, 500) : null,
        linkedin: linkedin ? String(linkedin).slice(0, 200) : null,
        instagram: instagram ? String(instagram).slice(0, 200) : null,
        hourlyRate: Math.round(rate),
        status: "pending",
        userId: linkedUser ? linkedUser.id : null
      }
    });

    await createConsultantSession(consultant.id);

    return NextResponse.json({ ok: true, id: consultant.id });
  } catch (e: any) {
    console.error("consultant register error:", e?.message);
    return NextResponse.json({ error: "خطا در ثبت‌نام" }, { status: 500 });
  }
}