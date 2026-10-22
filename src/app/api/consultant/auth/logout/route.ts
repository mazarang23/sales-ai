import { NextRequest, NextResponse } from "next/server";
import { destroyConsultantSession } from "@/lib/consultant-auth";

async function handle(req: NextRequest) {
  await destroyConsultantSession();
  return NextResponse.redirect(new URL("/consultant/login", req.url));
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}
