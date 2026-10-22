import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseAmount, parseDate } from "@/lib/excel/detect-columns";
import { parseAmountText } from "@/lib/excel/parse-amount-text";
import { applyMerges, MergeRule } from "@/lib/excel/merge-columns";
import { applyCurrency, Currency } from "@/lib/excel/currency";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json();
  const fieldMap = body.fieldMap || {};
  const merges: MergeRule[] = body.merges || [];
  const currency: Currency = body.currency || "toman";

  const upload = await db.upload.findFirst({
    where: { id, userId: user.id },
    include: { mappings: true }
  });
  if (!upload || !upload.mappings) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const rows = await db.dataRow.findMany({ where: { uploadId: upload.id } });

  let updated = 0;
  for (const r of rows) {
    const raw = applyMerges(r.raw as any, merges);
    const customerVal = fieldMap.customer ? raw[fieldMap.customer] : null;
    const productVal = fieldMap.product ? raw[fieldMap.product] : null;
    const amountVal = fieldMap.amount ? raw[fieldMap.amount] : null;
    const dateVal = fieldMap.date ? raw[fieldMap.date] : null;
    const orderVal = fieldMap.orderId ? raw[fieldMap.orderId] : null;

    let amount = parseAmount(amountVal);
    if (amount == null) {
      amount = parseAmountText(amountVal);
    }
    amount = applyCurrency(amount, currency);

    await db.dataRow.update({
      where: { id: r.id },
      data: {
        raw,
        customer: customerVal != null ? String(customerVal) : null,
        product: productVal != null ? String(productVal) : null,
        amount,
        date: parseDate(dateVal),
        orderId: orderVal != null ? String(orderVal) : null
      }
    });
    updated++;
  }

  const originalHeaders = (upload.mappings.headers as string[]) || [];
  const existingMerged = (upload.mappings.mergedColumns as any[]) || [];
  const baseHeaders = originalHeaders.filter(
    h => !existingMerged.some((m: any) => m.name === h)
  );
  const mergeNames = merges.map(m => m.name).filter(Boolean);
  const finalHeaders = [...baseHeaders, ...mergeNames];

  await db.mapping.update({
    where: { uploadId: upload.id },
    data: { fieldMap, mergedColumns: merges as any, headers: finalHeaders }
  });

  // پاک کردن کش کوهورت (چون داده‌ها تغییر کردند)
  await db.insight.deleteMany({
    where: { uploadId: upload.id, kind: "cohort" }
  });

  return NextResponse.json({ ok: true, updated, headers: finalHeaders, currency });
}