import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { createHash } from "crypto";
import { rateLimit } from "@/lib/rate-limit";

function hash(pw: string) {
  return createHash("sha256")
    .update(pw + (process.env.SESSION_SECRET || ""))
    .digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    // rate limit: ۱۰ تلاش در ۵ دقیقه
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`login:${ip}`, 10, 5 * 60 * 1000)) {
      return NextResponse.json(
        { error: "تلاش‌های زیاد. لطفاً بعداً امتحان کنید." },
        { status: 429 }
      );
    }

    if (!/^09\d{9}$/.test(String(phone || ""))) {
      return NextResponse.json({ error: "شماره معتبر نیست" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json({ error: "شماره یا رمز عبور اشتباه است" }, { status: 400 });
    }
    if (!user.password) {
      return NextResponse.json(
        { error: "این حساب رمز ندارد. لطفاً ثبت‌نام کنید." },
        { status: 400 }
      );
    }
    if (user.password !== hash(password)) {
      return NextResponse.json({ error: "شماره یا رمز عبور اشتباه است" }, { status: 400 });
    }

    await createSession(user.id);
    return NextResponse.json({ ok: true, role: user.role });
  } catch (e: any) {
    console.error("login error:", e?.message);
    return NextResponse.json({ error: "خطا در ورود" }, { status: 500 });
  }
}