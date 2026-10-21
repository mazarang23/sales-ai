import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";

const COOKIE = "cid";
const TTL_DAYS = 14;

export function hashPassword(pw: string) {
  return createHash("sha256")
    .update(pw + (process.env.SESSION_SECRET || ""))
    .digest("hex");
}

export async function createConsultantSession(consultantId: string) {
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + TTL_DAYS * 86400000);
  await db.consultantSession.create({
    data: { consultantId, token, expiresAt }
  });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/"
  });
}

export async function destroyConsultantSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (token) {
    await db.consultantSession.deleteMany({ where: { token } });
  }
  cookieStore.delete(COOKIE);
}

export async function getCurrentConsultant() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.consultantSession.findUnique({
    where: { token },
    include: { consultant: true }
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) return null;
  return session.consultant;
}