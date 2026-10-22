import { NextResponse } from "next/server";
import { buildGoogleAuthorizationUrl, createGoogleState, getRequestOrigin, googleConfigured, googleRedirectUri } from "@/lib/google-oauth";

export async function GET(req: Request) {
  if (!googleConfigured()) {
    return NextResponse.json({ error: "Google OAuth تنظیم نشده است" }, { status: 503 });
  }
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") === "consultant" ? "consultant" : "customer";
  const state = await createGoogleState(kind);
  const origin = getRequestOrigin(req);
  const redirectUri = googleRedirectUri(origin, kind);
  return NextResponse.redirect(buildGoogleAuthorizationUrl(redirectUri, state));
}
