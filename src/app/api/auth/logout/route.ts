import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

async function handle() {
  await destroySession();
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}

export async function POST() {
  return handle();
}

export async function GET() {
  return handle();
}