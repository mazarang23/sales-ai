import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { computeKpis, topBy } from "@/lib/analytics/kpi";
import { computeRfm } from "@/lib/analytics/rfm";
import { growthPlan } from "@/lib/ai/growth-agent";
import { getModelForPlan, getGrowthPlansLimit } from "@/lib/plans";
import { formatDate } from "@/lib/utils";
import { recordAiUsage } from "@/lib/ai/usage";

export const maxDuration = 90;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const uploadId = String(body.uploadId || "").trim();
    if (!uploadId) return NextResponse.json({ error: "شناسه فایل تحلیل ارسال نشده است." }, { status: 400 });

    const upload = await db.upload.findFirst({ where: { id: uploadId, userId: user.id } });
    if (!upload) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    const growthLimit = getGrowthPlansLimit(user.plan);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const count = await db.recommendation.count({ where: { upload: { userId: user.id }, createdAt: { gte: monthStart } } });
    if (count >= growthLimit) return NextResponse.json({ error: "LIMIT_REACHED", message: `سقف برنامه رشد پلن شما (${growthLimit} در ماه) پر شده است.` }, { status: 403 });


    const rows = await db.dataRow.findMany({ where: { uploadId }, take: 500000, orderBy: { date: "asc" } });
    if (!rows.length) return NextResponse.json({ error: "برای این فایل داده‌ای جهت تحلیل پیدا نشد." }, { status: 400 });
    const kpis = computeKpis(rows as any);
    const topProducts = topBy(rows as any, "product", 5);
    const rfm = computeRfm(rows as any);
    const segments = { Champions: 0, Loyal: 0, Potential: 0, AtRisk: 0, Lost: 0 };
    for (const r of rfm) if (r.segment in segments) segments[r.segment as keyof typeof segments] += 1;
    let minDate = Infinity, maxDate = 0;
    for (const r of rows) if (r.date) { const t = new Date(r.date).getTime(); if (t < minDate) minDate = t; if (t > maxDate) maxDate = t; }

    const model = getModelForPlan(user.plan);
    const plan = await growthPlan({
      industry: user.industry || "خرده‌فروشی", kpis, topProducts, segments,
      dateRange: { from: minDate !== Infinity ? formatDate(new Date(minDate)) : "—", to: maxDate ? formatDate(new Date(maxDate)) : "—" }, model
    });

    if (plan.source === "ai") {
      const usage = await recordAiUsage({ userId: user.id, task: "growth", model, usage: plan.usage, uploadId, chargeWallet: false });
    }

    const rec = await db.recommendation.create({ data: { uploadId, industry: user.industry || "خرده‌فروشی", actions: plan.actions as any } });
    return NextResponse.json({ id: rec.id, actions: plan.actions, source: plan.source });
  } catch (e: any) {
    console.error("growth route error:", e?.message || e);
    return NextResponse.json({ error: "خطا در ساخت برنامه رشد. لطفاً دوباره تلاش کنید." }, { status: 500 });
  }
}
