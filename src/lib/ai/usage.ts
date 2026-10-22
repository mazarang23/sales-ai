import { db } from "@/lib/db";

export type AiUsageKind = "assistant" | "growth" | "explain" | "translation";

const USD_TO_TOMAN = Number(process.env.AI_USD_TO_TOMAN || 0);
const ALLOCATION_RATIO = Number(process.env.AI_ALLOCATION_RATIO || 2 / 3);

export function usdToToman(usd: number): number {
  if (!Number.isFinite(usd) || usd <= 0 || USD_TO_TOMAN <= 0) return 0;
  return Math.ceil(usd * USD_TO_TOMAN);
}

export function getAiEconomicsConfig() {
  return {
    usdToToman: USD_TO_TOMAN,
    allocationRatio: ALLOCATION_RATIO,
    configured: USD_TO_TOMAN > 0
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

  for (const row of rows) {
    const p = row.payload as any;
    requests += 1;
    promptTokens += Number(p.promptTokens || 0);
    completionTokens += Number(p.completionTokens || 0);
    totalTokens += Number(p.totalTokens || 0);
    costUsd += Number(p.costUsd || 0);
    costToman += Number(p.costToman || 0);
  }

  return { requests, promptTokens, completionTokens, totalTokens, costUsd, costToman };
}

export async function recordAiUsage(input: {
  userId: string;
  task: AiUsageKind;
  model: string;
  usage?: any;
  costUsd?: number;
  uploadId?: string;
}) {
  const promptTokens = Number(input.usage?.prompt_tokens || 0);
  const completionTokens = Number(input.usage?.completion_tokens || 0);
  const totalTokens = Number(input.usage?.total_tokens || promptTokens + completionTokens);
  const reportedCost = Number(input.usage?.cost || 0);
  const costUsd = Number.isFinite(input.costUsd) && input.costUsd! > 0 ? input.costUsd! : reportedCost;
  const costToman = usdToToman(costUsd);

  await db.insight.create({
    data: {
      uploadId: input.uploadId || undefined,
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
        recordedAt: new Date().toISOString()
      }
    }
  });

  if (costToman > 0) {
    const charged = await db.user.updateMany({
      where: { id: input.userId, walletBalance: { gte: costToman } },
      data: { walletBalance: { decrement: costToman } }
    });
    if (charged.count === 0) {
      return { charged: false, costToman, costUsd, promptTokens, completionTokens, totalTokens };
    }
  }

  return { charged: true, costToman, costUsd, promptTokens, completionTokens, totalTokens };
}

export async function getAiWallet(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { walletBalance: true } });
  return user?.walletBalance ?? 0;
}

export function allocationFromPayment(amountToman: number): number {
  return Math.floor(Math.max(0, amountToman) * ALLOCATION_RATIO);
}
