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
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "تلاش‌های زیاد. لطفاً بعداً امتحان کنید." },
        { status: 429 }
      );
    }

    const { phone, name, password, industry } = await req.json();
    if (!/^09\d{9}$/.test(String(phone || ""))) {
      return NextResponse.json({ error: "شماره معتبر نیست" }, { status: 400 });
    }
    if (!password || String(password).length < 6) {
      return NextResponse.json({ error: "رمز حداقل ۶ کاراکتر" }, { status: 400 });
    }
    if (!industry) {
      return NextResponse.json({ error: "صنف را انتخاب کنید" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json(
        { error: "این شماره قبلاً ثبت‌نام کرده. وارد شوید." },
        { status: 400 }
      );
    }

    const adminPhone = process.env.ADMIN_PHONE;
    const role = adminPhone && phone === adminPhone ? "ADMIN" : "USER";

    const user = await db.user.create({
      data: {
        phone,
        name: name || null,
        password: hash(password),
        industry,
        role
      }
    });

    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("register error:", e?.message);
    return NextResponse.json({ error: "خطا در ثبت‌نام" }, { status: 500 });
  }
}