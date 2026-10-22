import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const PLANS: Record<string, number> = { pro: 890000, business: 4900000 };
const STORAGE_DIR = process.env.STORAGE_DIR || "./.storage";
const MAX_PROOF_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const form = await req.formData();
  const plan = String(form.get("plan") || "");
  const reference = String(form.get("reference") || "").trim();
  const proof = form.get("proof");
  if (!PLANS[plan]) return NextResponse.json({ error: "پلن نامعتبر" }, { status: 400 });
  if (reference.length < 3) return NextResponse.json({ error: "شماره پیگیری را وارد کنید" }, { status: 400 });
  if (proof instanceof File && proof.size > MAX_PROOF_SIZE) return NextResponse.json({ error: "حجم رسید نباید بیشتر از ۵ مگابایت باشد" }, { status: 400 });

  let proofKey: string | null = null;
  if (proof instanceof File && proof.size > 0) {
    const type = proof.type || "application/octet-stream";
    if (!type.startsWith("image/") && type !== "application/pdf") return NextResponse.json({ error: "رسید باید تصویر یا PDF باشد" }, { status: 400 });
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    const ext = path.extname(proof.name).replace(/[^a-zA-Z0-9.]/g, "").slice(0, 8) || ".bin";
    const stored = `payment-proof-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    await fs.writeFile(path.join(STORAGE_DIR, stored), Buffer.from(await proof.arrayBuffer()));
    proofKey = `proof:${stored}`;
  }

  await db.subscription.create({ data: { userId: user.id, plan, amount: PLANS[plan], status: "pending", authority: `manual:${reference.slice(0, 100)}`, refId: proofKey } });
  return NextResponse.json({ ok: true });
}
