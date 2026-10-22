import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { consultantId, action } = await req.json();
  if (typeof consultantId !== "string" || !["approve", "reject", "show", "hide"].includes(action)) {
    return NextResponse.json({ error: "action نامعتبر" }, { status: 400 });
  }
  const consultant = await db.consultant.findUnique({ where: { id: consultantId }, select: { id: true, status: true } });
  if (!consultant) return NextResponse.json({ error: "مشاور پیدا نشد" }, { status: 404 });
  if (action === "show" && consultant.status !== "approved_hidden") {
    return NextResponse.json({ error: "وضعیت مشاور قابل تغییر نیست" }, { status: 400 });
  }
  const status = action === "approve" || action === "show" ? "approved"
    : action === "hide" ? "approved_hidden" : "rejected";
  await db.consultant.update({ where: { id: consultantId }, data: { status } });
  return NextResponse.json({ ok: true, status });
}