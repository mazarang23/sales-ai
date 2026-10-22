import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

async function handle(req: NextRequest) {
  await destroySession();

  // Prefer the public host forwarded by the reverse proxy. req.url can
  // contain the internal container address (for example 0.0.0.0:3000).
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || req.headers.get("host");
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || (host && !host.includes("localhost") ? "https" : "http");
  const origin = host ? `${protocol}://${host}` : req.nextUrl.origin;

  return NextResponse.redirect(new URL("/login", origin), 303);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}
