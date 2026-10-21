import { NextResponse } from "next/server";
import { destroyConsultantSession } from "@/lib/consultant-auth";

export async function POST() {
  await destroyConsultantSession();
  return NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  );
}

export async function GET() {
  await destroyConsultantSession();
  return NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  );
}