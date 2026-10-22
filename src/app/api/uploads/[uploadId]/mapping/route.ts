import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseAmount, parseDate } from "@/lib/excel/detect-columns";

type FieldMap = {
  customer?: string;
  product?: string;
  amount?: string;
  quantity?: string;
  date?: string;
  orderId?: string;
};

export async function GET(_req: NextRequest, context: { params: Promise<{ uploadId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { uploadId } = await context.params;
  const upload = await db.upload.findFirst({
    where: { id: uploadId, userId: user.id },
    include: { mappings: true }
  });
  if (!upload || !upload.mappings) return NextResponse.json({ error: "آپلود پیدا نشد" }, { status: 404 });
  return NextResponse.json({
    uploadId: upload.id,
    fileName: upload.fileName,
    headers: upload.mappings.headers,
    fieldMap: upload.mappings.fieldMap
  });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ uploadId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { uploadId } = await context.params;
  const upload = await db.upload.findFirst({
    where: { id: uploadId, userId: user.id },
    include: { mappings: true }
  });
  if (!upload || !upload.mappings) return NextResponse.json({ error: "آپلود پیدا نشد" }, { status: 404 });

  let body: { fieldMap?: FieldMap };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const headers = upload.mappings.headers as string[];
  const fieldMap = body.fieldMap || {};
  for (const value of Object.values(fieldMap)) {
    if (value && !headers.includes(value)) {
      return NextResponse.json({ error: "ستون انتخاب‌شده معتبر نیست" }, { status: 400 });
    }
  }

  await db.$transaction(async tx => {
    await tx.mapping.update({
      where: { uploadId },
      data: { fieldMap: fieldMap as any }
    });
    const rows = await tx.dataRow.findMany({
      where: { uploadId },
      select: { id: true, raw: true }
    });
    for (const row of rows) {
      const raw = row.raw as Record<string, any>;
      await tx.dataRow.update({
        where: { id: row.id },
        data: {
          customer: fieldMap.customer && raw[fieldMap.customer] != null ? String(raw[fieldMap.customer]) : null,
          product: fieldMap.product && raw[fieldMap.product] != null ? String(raw[fieldMap.product]) : null,
          amount: fieldMap.amount ? parseAmount(raw[fieldMap.amount]) : null,
          quantity: fieldMap.quantity ? parseAmount(raw[fieldMap.quantity]) : null,
          date: fieldMap.date ? parseDate(raw[fieldMap.date]) : null,
          orderId: fieldMap.orderId && raw[fieldMap.orderId] != null ? String(raw[fieldMap.orderId]) : null
        }
      });
    }
    await tx.insight.deleteMany({ where: { uploadId } });
  });

  return NextResponse.json({ ok: true, redirectTo: `/dashboard/${uploadId}` });
}
