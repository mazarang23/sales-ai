import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendSms, generateOtp } from "@/lib/sms";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!/^09\d{9}$/.test(String(phone || ""))) {
      return NextResponse.json({ error: "شماره معتبر نیست" }, { status: 400 });
    }

    // ۳ درخواست در ۵ دقیقه
    if (!rateLimit(`otp:${phone}`, 3, 5 * 60 * 1000)) {
      return NextResponse.json(
        { error: "تعداد درخواست زیاد. ۵ دقیقه صبر کنید." },
        { status: 429 }
      );
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await db.user.upsert({
      where: { phone: String(phone) },
      update: { otpCode: code, otpExpiresAt: expiresAt },
      create: {
        phone: String(phone),
        otpCode: code,
        otpExpiresAt: expiresAt,
        role: "USER"
      }
    });

    const sent = await sendSms(String(phone), `کد ورود فروشیار: ${code}`);
    if (!sent) {
      return NextResponse.json({ error: "خطا در ارسال پیامک" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("send-otp error:", e?.message);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}