import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null, consultant: null });

  const consultant = await db.consultant.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true, displayName: true }
  });

  return NextResponse.json({
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      plan: user.plan
    },
    consultant
  });
}