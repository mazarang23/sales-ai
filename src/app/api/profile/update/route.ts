import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { name, industry } = await req.json();
  await db.user.update({
    where: { id: user.id },
    data: {
      name: name ? String(name) : null,
      industry: industry ? String(industry) : null
    }
  });
  return NextResponse.json({ ok: true });
}