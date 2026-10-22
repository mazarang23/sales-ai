import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, code, name, industry } = await req.json();
    if (!/^09\d{9}$/.test(String(phone || ""))) return NextResponse.json({ error: "شماره معتبر نیست" }, { status: 400 });
    if (!code || String(code).length !== 6) return NextResponse.json({ error: "کد ۶ رقمی وارد کنید" }, { status: 400 });

    const current = await getCurrentUser();
    const existing = await db.user.findUnique({ where: { phone: String(phone) } });
    if (current && current.phone !== String(phone)) {
      if (existing && existing.id !== current.id) return NextResponse.json({ error: "این شماره به حساب دیگری متصل است. ابتدا با همان حساب وارد شوید." }, { status: 409 });
      if (!current.otpCode || !current.otpExpiresAt) return NextResponse.json({ error: "ابتدا کد تأیید را درخواست کنید" }, { status: 400 });
      if (current.otpExpiresAt < new Date()) return NextResponse.json({ error: "کد منقضی شده. دوباره درخواست کن." }, { status: 400 });
      if (current.otpCode !== String(code)) return NextResponse.json({ error: "کد اشتباه است" }, { status: 400 });
      const user = await db.user.update({ where: { id: current.id }, data: { phone: String(phone), phoneVerifiedAt: new Date(), otpCode: null, otpExpiresAt: null, name: name || current.name, industry: industry || current.industry } });
      await createSession(user.id);
      return NextResponse.json({ ok: true, role: user.role, linkedCurrentAccount: true });
    }

    const user = existing;
    if (!user) return NextResponse.json({ error: "کاربر پیدا نشد" }, { status: 404 });
    if (!user.otpCode || !user.otpExpiresAt) return NextResponse.json({ error: "کد ارسال نشده" }, { status: 400 });
    if (user.otpExpiresAt < new Date()) return NextResponse.json({ error: "کد منقضی شده. دوباره درخواست کن." }, { status: 400 });
    if (user.otpCode !== String(code)) return NextResponse.json({ error: "کد اشتباه است" }, { status: 400 });
    const updated = await db.user.update({ where: { id: user.id }, data: { phoneVerifiedAt: new Date(), otpCode: null, otpExpiresAt: null, name: name || user.name, industry: industry || user.industry } });
    await createSession(user.id);
    return NextResponse.json({ ok: true, role: updated.role });
  } catch (e) {
    console.error("verify-otp error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "خطا در تأیید کد" }, { status: 500 });
  }
}