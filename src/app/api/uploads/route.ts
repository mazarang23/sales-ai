import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { promises as fs } from "fs";
import path from "path";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { detectColumns, parseAmount, parseDate } from "@/lib/excel/detect-columns";
import { parseAmountText } from "@/lib/excel/parse-amount-text";
import { applyCurrency, Currency } from "@/lib/excel/currency";
import { getMaxRows, PLANS, getEffectivePlan } from "@/lib/plans";

export const runtime = "nodejs";
export const maxDuration = 300;
const STORAGE_DIR = process.env.STORAGE_DIR || "./.storage";
const MAX_SIZE = 10 * 1024 * 1024;
async function ensureDir(dir: string) { try { await fs.access(dir); } catch { await fs.mkdir(dir, { recursive: true }); } }

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const activePlan = getEffectivePlan(user);
  const plan = PLANS[activePlan];
  const maxRows = getMaxRows(activePlan);
  const planLabel = plan.label;
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const appendToUploadId = form.get("appendToUploadId") as string | null;
  if (!file) return NextResponse.json({ error: "فایلی انتخاب نشده" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "فایل بزرگ‌تر از ۱۰ مگابایت است" }, { status: 400 });

  let appendTarget: any = null;
  if (appendToUploadId) {
    appendTarget = await db.upload.findFirst({ where: { id: appendToUploadId, userId: user.id }, include: { mappings: true } });
    if (!appendTarget) return NextResponse.json({ error: "آپلود قبلی پیدا نشد" }, { status: 404 });
  } else {
    const uploadCount = await db.upload.count({ where: { userId: user.id } });
    if (uploadCount >= plan.maxUploads) {
      return NextResponse.json({ error: `سقف فایل‌های پلن «${planLabel}» (${plan.maxUploads.toLocaleString("fa-IR")} فایل) پر شده است. برای آپلود فایل جدید، پلن خود را ارتقا دهید.`, code: "UPLOAD_LIMIT", maxUploads: plan.maxUploads }, { status: 403 });
    }
  }

  const buf = Buffer.from(await file.arrayBuffer());
  let wb;
  try { wb = XLSX.read(buf, { cellDates: true }); } catch { return NextResponse.json({ error: "فایل اکسل نامعتبر است" }, { status: 400 }); }
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: null, raw: true });
  if (json.length === 0) return NextResponse.json({ error: "فایل خالی است" }, { status: 400 });

  if (appendTarget) {
    const mapping = (appendTarget.mappings?.fieldMap || {}) as Record<string, string>;
    const incomingHeaders = new Set(Object.keys(json[0] || {}));
    const requiredFields = ["customer", "product", "amount", "quantity", "date", "orderId"]
      .map(key => mapping[key])
      .filter((header): header is string => typeof header === "string" && header.length > 0);
    const missingHeaders = [...new Set(requiredFields.filter(header => !incomingHeaders.has(header)))];
    if (missingHeaders.length) {
      return NextResponse.json({
        error: "ستون‌های فایل جدید با فایل قبلی سازگار نیستند. برای جلوگیری از ثبت ناقص داده‌ها، فایل اضافه نشد.",
        code: "APPEND_COLUMNS_MISMATCH",
        missingHeaders
      }, { status: 400 });
    }
  }

  const existingRowCount = appendTarget ? appendTarget.rowCount : 0;
  const totalRows = existingRowCount + json.length;
  if (totalRows > maxRows) return NextResponse.json({ error: `تعداد ردیف‌ها (${totalRows.toLocaleString("fa-IR")}) بیشتر از سقف پلن «${planLabel}» (${maxRows.toLocaleString("fa-IR")}) است.`, code: "ROW_LIMIT", maxRows, currentPlan: activePlan }, { status: 400 });

  await ensureDir(STORAGE_DIR);
  const safeName = file.name.replace(/[^\w.\-\u0600-\u06FF]/g, "_");
  const storedName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const filePath = path.join(STORAGE_DIR, storedName);
  await fs.writeFile(filePath, buf);

  try {
    if (appendTarget) {
      const mapping = (appendTarget.mappings?.fieldMap || {}) as Record<string, string>;
      const currency = (mapping._currency || "rial") as Currency;
      const chunkSize = 2000;
      for (let i = 0; i < json.length; i += chunkSize) {
        const chunk = json.slice(i, i + chunkSize);
        await db.dataRow.createMany({ data: chunk.map(r => {
          let amount = mapping.amount ? parseAmount(r[mapping.amount]) : null;
          if (amount == null && mapping.amount) amount = parseAmountText(r[mapping.amount]);
          amount = applyCurrency(amount, currency);
          return {
            uploadId: appendTarget.id,
            raw: r as any,
            customer: mapping.customer && r[mapping.customer] != null ? String(r[mapping.customer]) : null,
            product: mapping.product && r[mapping.product] != null ? String(r[mapping.product]) : null,
            amount,
            quantity: mapping.quantity ? parseAmount(r[mapping.quantity]) : null,
            date: mapping.date ? parseDate(r[mapping.date]) : null,
            orderId: mapping.orderId && r[mapping.orderId] != null ? String(r[mapping.orderId]) : null
          };
        }) });
      }
      await db.upload.update({ where: { id: appendTarget.id }, data: { rowCount: totalRows, fileSize: appendTarget.fileSize + buf.length, status: "READY" } });
      await db.insight.deleteMany({ where: { uploadId: appendTarget.id } });
      await db.recommendation.deleteMany({ where: { uploadId: appendTarget.id } });
      return NextResponse.json({ uploadId: appendTarget.id, rowCount: totalRows, appendedRows: json.length, sheetCount: wb.SheetNames.length, appended: true });
    }

    const headers = Object.keys(json[0]);
    const mapping = { ...detectColumns(headers, json.slice(0, 20)), _currency: "rial" };
    const upload = await db.upload.create({ data: { userId: user.id, fileName: file.name, fileKey: storedName, fileSize: buf.length, sheetCount: wb.SheetNames.length, rowCount: json.length, status: "PROCESSING", mappings: { create: { fieldMap: mapping, mergedColumns: [], headers } } } });
    const chunkSize = 2000;
    for (let i = 0; i < json.length; i += chunkSize) {
      const chunk = json.slice(i, i + chunkSize);
      await db.dataRow.createMany({ data: chunk.map(r => ({ uploadId: upload.id, raw: r as any, customer: mapping.customer && r[mapping.customer] != null ? String(r[mapping.customer]) : null, product: mapping.product && r[mapping.product] != null ? String(r[mapping.product]) : null, amount: mapping.amount ? parseAmount(r[mapping.amount]) : null, quantity: mapping.quantity ? parseAmount(r[mapping.quantity]) : null, date: mapping.date ? parseDate(r[mapping.date]) : null, orderId: mapping.orderId && r[mapping.orderId] != null ? String(r[mapping.orderId]) : null })) });
    }
    await db.upload.update({ where: { id: upload.id }, data: { status: "READY" } });
    return NextResponse.json({ uploadId: upload.id, rowCount: json.length, sheetCount: wb.SheetNames.length, headers, mapping });
  } catch (e) {
    try { await fs.unlink(filePath); } catch {}
    console.error("upload error:", e);
    return NextResponse.json({ error: "خطا در پردازش فایل" }, { status: 500 });
  }
}
