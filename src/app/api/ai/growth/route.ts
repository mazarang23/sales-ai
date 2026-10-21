import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { computeKpis, topBy } from "@/lib/analytics/kpi";
import { computeRfm } from "@/lib/analytics/rfm";
import { growthPlan } from "@/lib/ai/growth-agent";
import { getModelForPlan, getGrowthPlansLimit } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

export const maxDuration = 90;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const growthLimit = getGrowthPlansLimit(user.plan);
  const existingCount = await db.recommendation.count({ where: { uploadId: (await req.json().catch(() => ({}))).uploadId || "" } });

  const body = await req.json().catch(() => ({}));
  const uploadId = String(body.uploadId || "");

  const upload = await db.upload.findFirst({ where: { id: uploadId, userId: user.id } });
  if (!upload) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const count = await db.recommendation.count({ where: { uploadId } });
  if (user.plan === "free" && count >= growthLimit) {
    return NextResponse.json(
      {
        error: "LIMIT_REACHED",
        message: `سقف برنامه رشد پلن شما (${growthLimit}) پر شده. برای ادامه، پلن خود را ارتقا دهید.`
      },
      { status: 403 }
    );
  }

  const rows = await db.dataRow.findMany({ where: { uploadId } });
  const kpis = computeKpis(rows as any);
  const topProducts = topBy(rows as any, "product", 5);
  const rfm = computeRfm(rows as any);
  const segments = { Champions: 0, Loyal: 0, Potential: 0, AtRisk: 0, Lost: 0 };
  for (const r of rfm) segments[r.segment] = (segments[r.segment] || 0) + 1;

  let minDate = Infinity, maxDate = 0;
  for (const r of rows) {
    if (r.date) {
      const t = new Date(r.date).getTime();
      if (t < minDate) minDate = t;
      if (t > maxDate) maxDate = t;
    }
  }

  const model = getModelForPlan(user.plan);
  console.log("growth: plan:", user.plan, "model:", model);

  const plan = await growthPlan({
    industry: user.industry || "خرده‌فروشی",
    kpis,
    topProducts,
    segments,
    dateRange: {
      from: minDate !== Infinity ? formatDate(new Date(minDate)) : "—",
      to: maxDate ? formatDate(new Date(maxDate)) : "—"
    },
    model
  });

  const rec = await db.recommendation.create({
    data: { uploadId, industry: user.industry || "خرده‌فروشی", actions: plan.actions as any }
  });

  return NextResponse.json({ id: rec.id, actions: plan.actions, source: plan.source });
}