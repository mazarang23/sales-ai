import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const uploads = await db.upload.findMany({
    where: { userId: user.id, status: "READY" },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, fileName: true, rowCount: true, createdAt: true }
  });

  return NextResponse.json({ uploads });
}