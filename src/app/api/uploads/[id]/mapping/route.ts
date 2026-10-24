import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseAmount, parseDate } from "@/lib/excel/detect-columns";
import { parseAmountText } from "@/lib/excel/parse-amount-text";
import { applyMerges, MergeRule } from "@/lib/excel/merge-columns";
import { applyCurrency, Currency } from "@/lib/excel/currency";

export const runtime = "nodejs";
export const maxDuration = 300;
const UPDATE_CONCURRENCY = 25;

type ProgressEvent =
  | { type: "progress"; processed: number; total: number; percent: number; elapsedMs: number; etaMs: number | null }
  | { type: "done"; updated: number; headers: string[]; currency: Currency }
  | { type: "error"; error: string };

function jsonEvent(event: ProgressEvent) {
  return `${JSON.stringify(event)}\n`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json();
  const fieldMap = { ...(body.fieldMap || {}) } as Record<string, string>;
  const merges: MergeRule[] = body.merges || [];
  const currency: Currency = body.currency || "rial";
  fieldMap._currency = currency;

  const upload = await db.upload.findFirst({ where: { id, userId: user.id }, include: { mappings: true } });
  if (!upload || !upload.mappings) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const rows = await db.dataRow.findMany({ where: { uploadId: upload.id } });
  const analyticsFieldMap = { ...fieldMap };
  delete analyticsFieldMap._currency;

  const originalHeaders = (upload.mappings.headers as string[]) || [];
  const existingMerged = (upload.mappings.mergedColumns as any[]) || [];
  const baseHeaders = originalHeaders.filter(h => !existingMerged.some((m: any) => m.name === h));
  const mergeNames = merges.map(m => m.name).filter(Boolean);
  const finalHeaders = [...baseHeaders, ...mergeNames];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const startedAt = Date.now();
      let processed = 0;
      const send = (event: ProgressEvent) => controller.enqueue(encoder.encode(jsonEvent(event)));

      try {
        if (rows.length === 0) send({ type: "progress", processed: 0, total: 0, percent: 100, elapsedMs: 0, etaMs: 0 });

        for (let i = 0; i < rows.length; i += UPDATE_CONCURRENCY) {
          const batch = rows.slice(i, i + UPDATE_CONCURRENCY);
          await Promise.all(batch.map(async r => {
            const raw = applyMerges(r.raw as any, merges);
            const customerVal = analyticsFieldMap.customer ? raw[analyticsFieldMap.customer] : null;
            const productVal = analyticsFieldMap.product ? raw[analyticsFieldMap.product] : null;
            const amountVal = analyticsFieldMap.amount ? raw[analyticsFieldMap.amount] : null;
            const dateVal = analyticsFieldMap.date ? raw[analyticsFieldMap.date] : null;
            const orderVal = analyticsFieldMap.orderId ? raw[analyticsFieldMap.orderId] : null;
            let amount = parseAmount(amountVal);
            if (amount == null) amount = parseAmountText(amountVal);
            amount = applyCurrency(amount, currency);
            await db.dataRow.update({ where: { id: r.id }, data: { raw, customer: customerVal != null ? String(customerVal) : null, product: productVal != null ? String(productVal) : null, amount, date: parseDate(dateVal), orderId: orderVal != null ? String(orderVal) : null } });
          }));

          processed += batch.length;
          const elapsedMs = Date.now() - startedAt;
          const rate = processed > 0 ? processed / Math.max(elapsedMs, 1) : 0;
          const etaMs = rate > 0 ? Math.max(0, Math.round((rows.length - processed) / rate)) : null;
          send({ type: "progress", processed, total: rows.length, percent: rows.length ? Math.round((processed / rows.length) * 1000) / 10 : 100, elapsedMs, etaMs });
        }

        await db.mapping.update({ where: { uploadId: upload.id }, data: { fieldMap: fieldMap as any, mergedColumns: merges as any, headers: finalHeaders } });
        await db.insight.deleteMany({
          where: {
            uploadId: upload.id,
            kind: { in: ["dashboard_v2", "cohort", "cohort_v2", "cohort_v3", "rfm_v1", "rfm_v2", "trend_v1"] }
          }
        });
        send({ type: "done", updated: rows.length, headers: finalHeaders, currency });
        controller.close();
      } catch (error) {
        send({ type: "error", error: error instanceof Error ? error.message : "خطا در ذخیره نگاشت" });
        controller.close();
      }
    }
  });

  return new NextResponse(stream, { status: 200, headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" } });
}
