import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentConsultant } from "@/lib/consultant-auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, kind } = await req.json();
    if (!/^09\d{9}$/.test(String(phone || ""))) {
      return NextResponse.json({ error: "شماره معتبر نیست" }, { status: 400 });
    }

    if (kind === "consultant") {
      const consultant = await getCurrentConsultant();
      if (!consultant) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      if (consultant.phoneVerifiedAt && consultant.phone !== phone) {
        return NextResponse.json({ error: "برای تغییر شماره تأییدشده، باید کد پیامکی شماره جدید را تأیید کنید." }, { status: 409 });
      }
      const userWithPhone = await db.user.findUnique({ where: { phone: String(phone) }, select: { id: true } });
      const otherConsultant = await db.consultant.findUnique({ where: { phone: String(phone) }, select: { id: true } });
      if (userWithPhone && userWithPhone.id !== consultant.userId) {
        return NextResponse.json({ error: "این شماره به حساب دیگری متصل است." }, { status: 409 });
      }
      if (otherConsultant && otherConsultant.id !== consultant.id) {
        return NextResponse.json({ error: "این شماره به حساب مشاور دیگری متصل است." }, { status: 409 });
      }
      await db.consultant.update({
        where: { id: consultant.id },
        data: { phone: String(phone), phoneVerifiedAt: consultant.phone === phone ? consultant.phoneVerifiedAt : null }
      });
      return NextResponse.json({ ok: true, verified: false });
    }

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    if (user.phoneVerifiedAt && user.phone !== phone) {
      return NextResponse.json({ error: "برای تغییر شماره تأییدشده، باید کد پیامکی شماره جدید را تأیید کنید." }, { status: 409 });
    }
    const existing = await db.user.findUnique({ where: { phone: String(phone) }, select: { id: true } });
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "این شماره به حساب دیگری متصل است." }, { status: 409 });
    }
    const consultant = await db.consultant.findUnique({ where: { phone: String(phone) }, select: { userId: true } });
    if (consultant && consultant.userId && consultant.userId !== user.id) {
      return NextResponse.json({ error: "این شماره به حساب مشاور دیگری متصل است." }, { status: 409 });
    }
    await db.user.update({
      where: { id: user.id },
      data: { phone: String(phone), phoneVerifiedAt: user.phone === phone ? user.phoneVerifiedAt : null }
    });
    return NextResponse.json({ ok: true, verified: false });
  } catch (error) {
    console.error("save-unverified-phone error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "ذخیره شماره انجام نشد" }, { status: 500 });
  }
}
