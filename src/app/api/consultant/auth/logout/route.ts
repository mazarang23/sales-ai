import { NextRequest, NextResponse } from "next/server";
import { destroyConsultantSession } from "@/lib/consultant-auth";

async function handle(req: NextRequest) {
  await destroyConsultantSession();
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || req.headers.get("host");
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || (host && !host.includes("localhost") ? "https" : "http");
  const origin = host ? `${protocol}://${host}` : req.nextUrl.origin;
  return NextResponse.redirect(new URL("/consultant/login", origin), 303);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}
