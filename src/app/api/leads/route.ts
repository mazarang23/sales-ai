import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const phone = String(body.phone || "").trim();
  if (!/^09\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "Ø´Ù…Ø§Ø±Ù‡ Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª" }, { status: 400 });
  }
  await db.lead.create({
    data: {
      phone,
      industry: body.industry ? String(body.industry) : null,
      source: body.source ? String(body.source) : null
    }
  });
  return NextResponse.json({ ok: true });
}