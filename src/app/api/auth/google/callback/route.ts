import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { createConsultantSession } from "@/lib/consultant-auth";
import {
  consumeGoogleState,
  exchangeGoogleCode,
  fetchGoogleProfile,
  getRequestOrigin,
  googleConfigured,
  googleRedirectUri
} from "@/lib/google-oauth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const kind = url.searchParams.get("kind") === "consultant" ? "consultant" : "customer";
  const failPath = kind === "consultant" ? "/consultant/login" : "/login";

  try {
    if (!googleConfigured()) throw new Error("GOOGLE_NOT_CONFIGURED");
    if (!code || !(await consumeGoogleState(kind, state))) throw new Error("GOOGLE_STATE_INVALID");

    const origin = getRequestOrigin(req);
    const redirectUri = googleRedirectUri(origin, kind);
    const tokens = await exchangeGoogleCode(code, redirectUri);
    const profile = await fetchGoogleProfile(tokens.access_token);

    if (kind === "customer") {
      const byGoogle = await db.user.findUnique({ where: { googleSub: profile.sub } });
      if (byGoogle) {
        await createSession(byGoogle.id);
        return NextResponse.redirect(new URL(!byGoogle.phone ? "/complete-profile" : byGoogle.role === "ADMIN" ? "/admin" : "/dashboard", origin));
      }

      const byEmail = await db.user.findUnique({ where: { email: profile.email } });
      if (byEmail) {
        if (byEmail.googleSub && byEmail.googleSub !== profile.sub) throw new Error("GOOGLE_ACCOUNT_CONFLICT");
        const user = await db.user.update({
          where: { id: byEmail.id },
          data: { googleSub: profile.sub, name: byEmail.name || profile.name || null }
        });
        await createSession(user.id);
        return NextResponse.redirect(new URL(!user.phone ? "/complete-profile" : user.role === "ADMIN" ? "/admin" : "/dashboard", origin));
      }

      const user = await db.user.create({
        data: {
          email: profile.email,
          googleSub: profile.sub,
          name: profile.name || null,
          password: null
        }
      });
      await createSession(user.id);
      return NextResponse.redirect(new URL("/complete-profile", origin));
    }

    const byGoogle = await db.consultant.findUnique({ where: { googleSub: profile.sub } });
    if (byGoogle) {
      await createConsultantSession(byGoogle.id);
      return NextResponse.redirect(new URL(!byGoogle.phone || !byGoogle.userId ? "/consultant/complete-profile" : "/consultant/dashboard", origin));
    }

    const byEmail = await db.consultant.findUnique({ where: { email: profile.email } });
    if (byEmail) {
      if (byEmail.googleSub && byEmail.googleSub !== profile.sub) throw new Error("GOOGLE_ACCOUNT_CONFLICT");
      const consultant = await db.consultant.update({
        where: { id: byEmail.id },
        data: { googleSub: profile.sub, displayName: byEmail.displayName || profile.name || "مشاور" }
      });
      await createConsultantSession(consultant.id);
      return NextResponse.redirect(new URL(!consultant.phone || !consultant.userId ? "/consultant/complete-profile" : "/consultant/dashboard", origin));
    }

    const consultant = await db.consultant.create({
      data: {
        email: profile.email,
        googleSub: profile.sub,
        displayName: profile.name || "مشاور جدید",
        bio: "",
        password: null,
        photoUrl: profile.picture || null,
        hourlyRate: 0,
        status: "pending"
      }
    });
    await createConsultantSession(consultant.id);
    return NextResponse.redirect(new URL("/consultant/complete-profile", origin));
  } catch (error) {
    console.error("google oauth error:", error instanceof Error ? error.message : error);
    const reason = error instanceof Error ? error.message : "GOOGLE_AUTH_FAILED";
    return NextResponse.redirect(new URL(`${failPath}?googleError=${encodeURIComponent(reason)}`, getRequestOrigin(req)));
  }
}
