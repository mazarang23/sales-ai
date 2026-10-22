import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentConsultant } from "@/lib/consultant-auth";

export async function POST(req: NextRequest) {
  try {
    const consultant = await getCurrentConsultant();
    if (!consultant) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const body = await req.json();
    const phone = String(body.phone || "").trim();
    const displayName = String(body.displayName || "").trim();
    const bio = String(body.bio || "").trim();
    const linkedin = String(body.linkedin || "").trim() || null;
    const instagram = String(body.instagram || "").trim() || null;
    const hourlyRate = Number(body.hourlyRate);

    if (!/^09\d{9}$/.test(phone)) return NextResponse.json({ error: "شماره موبایل معتبر نیست" }, { status: 400 });
    if (displayName.length < 3) return NextResponse.json({ error: "نام نمایشی کوتاه است" }, { status: 400 });
    if (bio.length < 20) return NextResponse.json({ error: "بیوگرافی باید حداقل ۲۰ کاراکتر باشد" }, { status: 400 });
    if (!Number.isFinite(hourlyRate) || hourlyRate < 50000) return NextResponse.json({ error: "تعرفه ساعتی معتبر نیست" }, { status: 400 });

    const duplicate = await db.consultant.findFirst({ where: { phone, NOT: { id: consultant.id } }, select: { id: true } });
    if (duplicate) return NextResponse.json({ error: "این شماره قبلاً برای مشاور دیگری ثبت شده است" }, { status: 409 });

    const updated = await db.consultant.update({
      where: { id: consultant.id },
      data: { phone, displayName, bio, linkedin, instagram, hourlyRate }
    });
    return NextResponse.json({ ok: true, consultant: { id: updated.id, status: updated.status } });
  } catch (error) {
    console.error("consultant profile error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "خطا در ذخیره پروفایل" }, { status: 500 });
  }
}
