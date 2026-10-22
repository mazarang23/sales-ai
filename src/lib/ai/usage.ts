import { db } from "@/lib/db";
import { getUsdToTomanRate } from "@/lib/finance/usd-toman";

export type AiUsageKind = "assistant" | "growth" | "explain" | "translation";

const ALLOCATION_RATIO = 2 / 3;

export function getAiEconomicsConfig() {
  return {
    allocationRatio: ALLOCATION_RATIO,
    rateSource: "iran-market",
    configured: true
  };
}

export async function getAiUsageSummary(userId: string, since?: Date) {
  const rows = await db.insight.findMany({
    where: {
      kind: "ai_usage",
      createdAt: since ? { gte: since } : undefined,
      payload: { path: ["userId"], equals: userId }
    },
    select: { payload: true, createdAt: true }
  });

  let requests = 0;
  let promptTokens = 0;
  let completionTokens = 0;
  let totalTokens = 0;
  let costUsd = 0;
  let costToman = 0;
  let chargedToman = 0;

  for (const row of rows) {
    const p = row.payload as any;
    requests += 1;
    promptTokens += Number(p.promptTokens || 0);
    completionTokens += Number(p.completionTokens || 0);
    totalTokens += Number(p.totalTokens || 0);
    costUsd += Number(p.costUsd || 0);
    costToman += Number(p.costToman || 0);
    chargedToman += Number(p.chargedToman || 0);
  }

  return { requests, promptTokens, completionTokens, totalTokens, costUsd, costToman, chargedToman };
}

export async function recordAiUsage(input: {
  userId: string;
  task: AiUsageKind;
  model: string;
  usage?: any;
  costUsd?: number;
  uploadId: string;
}) {
  const promptTokens = Number(input.usage?.prompt_tokens || 0);
  const completionTokens = Number(input.usage?.completion_tokens || 0);
  const totalTokens = Number(input.usage?.total_tokens || promptTokens + completionTokens);
  const reportedCost = Number(input.usage?.cost || 0);
  const costUsd = Number.isFinite(input.costUsd) && input.costUsd! > 0 ? input.costUsd! : reportedCost;

  let rate = 0;
  let rateSource = "none";
  let rateFetchedAt: string | null = null;
  let costToman = 0;

  if (costUsd > 0) {
    const fx = await getUsdToTomanRate();
    rate = fx.rate;
    rateSource = fx.source;
    rateFetchedAt = fx.fetchedAt.toISOString();
    costToman = Math.ceil(costUsd * rate);
  }

  let chargedToman = 0;
  let charged = true;

  if (costToman > 0) {
    const result = await db.user.updateMany({
      where: { id: input.userId, walletBalance: { gte: costToman } },
      data: { walletBalance: { decrement: costToman } }
    });
    charged = result.count === 1;
    if (charged) chargedToman = costToman;
  }

  await db.insight.create({
    data: {
      uploadId: input.uploadId,
      kind: "ai_usage",
      payload: {
        userId: input.userId,
        task: input.task,
        model: input.model,
        promptTokens,
        completionTokens,
        totalTokens,
        costUsd,
        costToman,
        chargedToman,
        charged,
        usdToTomanRate: rate,
        rateSource,
        rateFetchedAt,
        recordedAt: new Date().toISOString()
      }
    }
  });

  return { charged, costToman, chargedToman, costUsd, promptTokens, completionTokens, totalTokens, usdToTomanRate: rate, rateSource };
}

export async function getAiWallet(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { walletBalance: true } });
  return user?.walletBalance ?? 0;
}

export function allocationFromPayment(amountToman: number): number {
  return Math.floor(Math.max(0, amountToman) * ALLOCATION_RATIO);
}
