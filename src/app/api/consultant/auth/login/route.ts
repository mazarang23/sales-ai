import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  createConsultantSession,
  hashPassword
} from "@/lib/consultant-auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();
    if (!/^09\d{9}$/.test(String(phone || ""))) {
      return NextResponse.json({ error: "شماره معتبر نیست" }, { status: 400 });
    }
    const consultant = await db.consultant.findUnique({ where: { phone } });
    if (!consultant) {
      return NextResponse.json(
        { error: "حساب مشاوری با این شماره پیدا نشد" },
        { status: 400 }
      );
    }
    if (consultant.password !== hashPassword(String(password))) {
      return NextResponse.json({ error: "رمز عبور اشتباه است" }, { status: 400 });
    }
    await createConsultantSession(consultant.id);
    return NextResponse.json({ ok: true, status: consultant.status });
  } catch (e: any) {
    console.error("consultant login error:", e?.message);
    return NextResponse.json({ error: "خطا در ورود" }, { status: 500 });
  }
}