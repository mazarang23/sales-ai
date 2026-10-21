import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { consultantId, action } = await req.json();
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action نامعتبر" }, { status: 400 });
  }
  await db.consultant.update({
    where: { id: consultantId },
    data: { status: action === "approve" ? "approved" : "rejected" }
  });
  return NextResponse.json({ ok: true });
}