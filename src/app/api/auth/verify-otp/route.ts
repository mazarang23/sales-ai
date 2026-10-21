import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, code, name, industry } = await req.json();
    if (!/^09\d{9}$/.test(String(phone || ""))) {
      return NextResponse.json({ error: "شماره معتبر نیست" }, { status: 400 });
    }
    if (!code || String(code).length !== 6) {
      return NextResponse.json({ error: "کد ۶ رقمی وارد کنید" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { phone: String(phone) } });
    if (!user) {
      return NextResponse.json({ error: "کاربر پیدا نشد" }, { status: 404 });
    }
    if (!user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json({ error: "کد ارسال نشده" }, { status: 400 });
    }
    if (user.otpExpiresAt < new Date()) {
      return NextResponse.json(
        { error: "کد منقضی شده. دوباره درخواست کن." },
        { status: 400 }
      );
    }
    if (user.otpCode !== String(code)) {
      return NextResponse.json({ error: "کد اشتباه است" }, { status: 400 });
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiresAt: null,
        name: name || user.name,
        industry: industry || user.industry
      }
    });

    await createSession(user.id);
    return NextResponse.json({ ok: true, role: user.role });
  } catch (e: any) {
    console.error("verify-otp error:", e?.message);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}