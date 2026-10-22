import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendSms, generateOtp } from "@/lib/sms";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!/^09\d{9}$/.test(String(phone || ""))) return NextResponse.json({ error: "شماره معتبر نیست" }, { status: 400 });
    if (!rateLimit(`otp:${phone}`, 3, 5 * 60 * 1000)) return NextResponse.json({ error: "تعداد درخواست زیاد. ۵ دقیقه صبر کنید." }, { status: 429 });

    const current = await getCurrentUser();
    const existing = await db.user.findUnique({ where: { phone: String(phone) } });
    if (current && current.phone !== phone && existing && existing.id !== current.id) {
      return NextResponse.json({ error: "این شماره قبلاً به حساب دیگری متصل است. با همان حساب وارد شوید." }, { status: 409 });
    }
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    if (current) {
      // Keep the pending OTP on the signed-in account so changing a phone never creates a duplicate user.
      await db.user.update({ where: { id: current.id }, data: { otpCode: code, otpExpiresAt: expiresAt } });
    } else {
      await db.user.upsert({
        where: { phone: String(phone) },
        update: { otpCode: code, otpExpiresAt: expiresAt },
        create: { phone: String(phone), otpCode: code, otpExpiresAt: expiresAt, role: "USER" }
      });
    }
    const sent = await sendSms(String(phone), `کد ورود فروشیار: ${code}`);
    if (!sent) return NextResponse.json({ error: "خطا در ارسال پیامک" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("send-otp error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "خطا در ارسال کد" }, { status: 500 });
  }
}