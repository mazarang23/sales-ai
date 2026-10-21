import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const uploadId = req.nextUrl.searchParams.get("uploadId");
  if (!uploadId) return NextResponse.json({ messages: [] });

  const messages = await db.chatMessage.findMany({
    where: { userId: user.id, uploadId },
    orderBy: { createdAt: "asc" },
    take: 100
  });

  return NextResponse.json({ messages });
}