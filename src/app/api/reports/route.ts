import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { message, uploadId } = await req.json();
  if (!message || String(message).trim().length < 3) {
    return NextResponse.json({ error: "متن گزارش خیلی کوتاه است" }, { status: 400 });
  }

  await db.ticket.create({
    data: {
      userId: user.id,
      phone: user.phone || "",
      type: "report",
      message: String(message).slice(0, 1000),
      uploadId: uploadId || null
    }
  });

  return NextResponse.json({ ok: true });
}
