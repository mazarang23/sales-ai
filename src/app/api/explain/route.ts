import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { computeKpis } from "@/lib/analytics/kpi";
import { explainAction } from "@/lib/ai/growth-agent";
import { getModelForPlan, getExplainLimit, getEffectivePlan } from "@/lib/plans";

export const maxDuration = 90;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const activePlan = getEffectivePlan(user);
    const explainLimit = getExplainLimit(activePlan);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const usedThisMonth = await db.insight.count({ where: { kind: "explain", createdAt: { gte: monthStart }, upload: { userId: user.id } } });
    if (usedThisMonth >= explainLimit) {
      return NextResponse.json(
        {
          error: "LIMIT_REACHED",
          message: `سقف توضیح بیشتر پلن شما (${explainLimit} در ماه) پر شده. برای ادامه، پلن خود را ارتقا دهید.`
        },
        { status: 403 }
      );
    }

    const { uploadId, action } = await req.json();
    if (!uploadId || !action || !action.title) {
      return NextResponse.json({ error: "اطلاعات ناقص است" }, { status: 400 });
    }

    const upload = await db.upload.findFirst({ where: { id: uploadId, userId: user.id } });
    if (!upload) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    const rows = await db.dataRow.findMany({ where: { uploadId } });
    const kpis = computeKpis(rows as any);

    const model = getModelForPlan(activePlan);
    console.log("explain: plan:", user.plan, "model:", model);

    const result = await explainAction(action, {
      industry: user.industry || "خرده‌فروشی",
      kpis,
      model
    });

    if (!result.explanation) {
      return NextResponse.json({ error: "مدل پاسخی تولید نکرد. لطفاً دوباره تلاش کنید." }, { status: 502 });
    }

    await db.user.update({
      where: { id: user.id },
      data: { aiQuestionsUsed: { increment: 1 } }
    });

    await db.insight.create({
      data: {
        uploadId,
        kind: "explain",
        payload: { actionTitle: action.title, ...result.explanation }
      }
    });

    return NextResponse.json({
      explanation: result.explanation,
      remaining: Math.max(0, explainLimit - usedThisMonth - 1)
    });
  } catch (e: any) {
    console.error("explain error:", e?.status, e?.message);
    return NextResponse.json({ error: "خطا در پردازش." }, { status: 500 });
  }
}