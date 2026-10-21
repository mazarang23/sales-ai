import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { userId, plan } = await req.json();
  if (plan !== "free" && plan !== "pro") {
    return NextResponse.json({ error: "پلن نامعتبر" }, { status: 400 });
  }
  await db.user.update({
    where: { id: userId },
    data: { plan, aiQuestionsUsed: plan === "pro" ? 0 : undefined }
  });
  return NextResponse.json({ ok: true });
}