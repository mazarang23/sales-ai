import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking || booking.userId !== user.id) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (booking.status !== "completed") {
    return NextResponse.json(
      { error: "فقط بعد از تکمیل جلسه می‌توان امتیاز داد" },
      { status: 400 }
    );
  }

  const existing = await db.review.findUnique({ where: { bookingId: id } });
  if (existing) {
    return NextResponse.json({ error: "قبلاً امتیاز داده‌اید" }, { status: 400 });
  }

  const { rating, comment } = await req.json();
  const r = Number(rating);
  if (!r || r < 1 || r > 5) {
    return NextResponse.json({ error: "امتیاز باید بین ۱ تا ۵" }, { status: 400 });
  }

  await db.review.create({
    data: {
      bookingId: id,
      rating: r,
      comment: comment ? String(comment).slice(0, 1000) : null
    }
  });

  return NextResponse.json({ ok: true });
}