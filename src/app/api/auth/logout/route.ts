import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

async function handle(req: NextRequest) {
  await destroySession();

  // Resolve the redirect from the incoming request so production never
  // falls back to localhost when NEXT_PUBLIC_APP_URL is not configured.
  return NextResponse.redirect(new URL("/login", req.url));
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}
