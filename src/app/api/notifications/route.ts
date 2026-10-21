import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentConsultant } from "@/lib/consultant-auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (user) {
    const items = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    const unread = await db.notification.count({
      where: { userId: user.id, readAt: null }
    });
    return NextResponse.json({ items, unread, role: user.role });
  }
  const consultant = await getCurrentConsultant();
  if (consultant) {
    const items = await db.notification.findMany({
      where: { consultantId: consultant.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    const unread = await db.notification.count({
      where: { consultantId: consultant.id, readAt: null }
    });
    return NextResponse.json({ items, unread, role: "consultant" });
  }
  return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const consultant = await getCurrentConsultant();
  if (!user && !consultant) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = await req.json();
  const ids: string[] = body.ids || [];
  if (Array.isArray(ids) && ids.length > 0) {
    await db.notification.updateMany({
      where: {
        id: { in: ids },
        ...(user ? { userId: user.id } : { consultantId: consultant!.id })
      },
      data: { readAt: new Date() }
    });
  }
  return NextResponse.json({ ok: true });
}