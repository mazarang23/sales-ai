import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json();
  const merges: Array<{ name: string; from: string[] }> = body.merges || [];

  const upload = await db.upload.findFirst({
    where: { id: params.id, userId: user.id },
    include: { mappings: true }
  });
  if (!upload || !upload.mappings) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const headers = upload.mappings.headers as string[];
  const existingMerged = (upload.mappings.mergedColumns as any[]) || [];
  const mergeNames = merges.map(m => m.name).filter(Boolean);
  const baseHeaders = headers.filter(h => !existingMerged.some((m: any) => m.name === h));
  const newHeaders = [...baseHeaders, ...mergeNames];

  await db.mapping.update({
    where: { uploadId: upload.id },
    data: { mergedColumns: merges as any, headers: newHeaders }
  });

  return NextResponse.json({ ok: true, headers: newHeaders });
}