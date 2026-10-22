import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { computeKpis } from "@/lib/analytics/kpi";
import { explainAction } from "@/lib/ai/growth-agent";
import { getModelForPlan, getExplainLimit } from "@/lib/plans";
import { recordAiUsage, getAiWallet } from "@/lib/ai/usage";

export const maxDuration = 90;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const explainLimit = getExplainLimit(user.plan);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const used = await db.insight.count({ where: { kind: "explain", createdAt: { gte: monthStart }, upload: { userId: user.id } } });
    if (used >= explainLimit) return NextResponse.json({ error: "LIMIT_REACHED", message: `سقف توضیح بیشتر پلن شما (${explainLimit} در ماه) پر شده است.` }, { status: 403 });

    const { uploadId, action } = await req.json();
    if (!uploadId || !action?.title) return NextResponse.json({ error: "اطلاعات ناقص است" }, { status: 400 });
    const upload = await db.upload.findFirst({ where: { id: uploadId, userId: user.id } });
    if (!upload) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    const wallet = await getAiWallet(user.id);
    if (user.plan !== "free" && wallet <= 0) return NextResponse.json({ error: "AI_CREDIT_EMPTY", message: "اعتبار هوش مصنوعی حساب شما تمام شده است." }, { status: 402 });

    const rows = await db.dataRow.findMany({ where: { uploadId }, take: 500000 });
    const kpis = computeKpis(rows as any);
    const model = getModelForPlan(user.plan);
    const result = await explainAction(action, { industry: user.industry || "خرده‌فروشی", kpis, model });
    if (!result.explanation) return NextResponse.json({ error: "مدل پاسخی تولید نکرد. لطفاً دوباره تلاش کنید." }, { status: 502 });

    const usage = await recordAiUsage({ userId: user.id, task: "explain", model, usage: result.usage, uploadId });
    if (!usage.charged && usage.costToman > 0 && user.plan !== "free") return NextResponse.json({ error: "AI_CREDIT_EMPTY", message: "اعتبار هوش مصنوعی برای این درخواست کافی نبود." }, { status: 402 });

    await db.insight.create({ data: { uploadId, kind: "explain", payload: { actionTitle: action.title, ...result.explanation } } });
    return NextResponse.json({ explanation: result.explanation, remaining: Math.max(0, explainLimit - used - 1), usage });
  } catch (e: any) {
    console.error("explain error:", e?.status, e?.message);
    return NextResponse.json({ error: "خطا در پردازش." }, { status: 500 });
  }
}
