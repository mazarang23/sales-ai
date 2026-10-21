import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const PLANS: Record<string, number> = {
  pro: 890000,
  business: 4900000
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { plan, reference } = await req.json();
  if (!PLANS[plan]) return NextResponse.json({ error: "پلن نامعتبر" }, { status: 400 });
  if (!reference || String(reference).trim().length < 3) {
    return NextResponse.json({ error: "شماره پیگیری را وارد کنید" }, { status: 400 });
  }

  await db.subscription.create({
    data: {
      userId: user.id,
      plan,
      amount: PLANS[plan],
      status: "pending",
      authority: `manual:${String(reference).slice(0, 100)}`
    }
  });

  return NextResponse.json({ ok: true });
}