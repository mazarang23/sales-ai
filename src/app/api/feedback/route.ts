import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { rating, text, uploadId } = await req.json();

  await db.ticket.create({
    data: {
      userId: user.id,
      phone: user.phone || "",
      type: "feedback",
      message: String(text || "").slice(0, 1000),
      rating: Number(rating) || null,
      uploadId: uploadId || null
    }
  });

  await db.user.update({
    where: { id: user.id },
    data: { feedbackGiven: true }
  });

  return NextResponse.json({ ok: true });
}
