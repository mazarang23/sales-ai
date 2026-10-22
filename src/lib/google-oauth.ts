import { randomBytes } from "crypto";
import { cookies } from "next/headers";

const STATE_COOKIE_PREFIX = "google_oauth_state_";
const STATE_TTL_SECONDS = 10 * 60;

export type GoogleProfile = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function googleRedirectUri(origin: string, kind: "customer" | "consultant") {
  return `${origin}/api/auth/google/callback?kind=${kind}`;
}

export async function createGoogleState(kind: "customer" | "consultant") {
  const state = randomBytes(24).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(`${STATE_COOKIE_PREFIX}${kind}`, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: STATE_TTL_SECONDS,
    path: "/"
  });
  return state;
}

export async function consumeGoogleState(kind: "customer" | "consultant", state: string | null) {
  const cookieStore = await cookies();
  const cookieName = `${STATE_COOKIE_PREFIX}${kind}`;
  const saved = cookieStore.get(cookieName)?.value;
  cookieStore.delete(cookieName);
  return Boolean(state && saved && state === saved);
}

export function getRequestOrigin(req: Request) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
  if (!host) throw new Error("HOST_NOT_AVAILABLE");
  return `${proto.split(",")[0].trim()}://${host}`;
}

export function buildGoogleAuthorizationUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri
    })
  });
  if (!response.ok) throw new Error("GOOGLE_TOKEN_EXCHANGE_FAILED");
  return response.json() as Promise<{ access_token: string; id_token?: string }>;
}

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });
  if (!response.ok) throw new Error("GOOGLE_PROFILE_FAILED");
  const profile = await response.json() as GoogleProfile;
  if (!profile.sub || !profile.email || profile.email_verified === false) {
    throw new Error("GOOGLE_EMAIL_NOT_VERIFIED");
  }
  return profile;
}
