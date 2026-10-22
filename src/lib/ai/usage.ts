import { db } from "@/lib/db";
import { getUsdToTomanRate } from "@/lib/finance/usd-toman";

export type AiUsageKind = "assistant" | "growth" | "explain" | "translation";

const ALLOCATION_RATIO = 2 / 3;

// User-facing AI credits are expressed as output-token-equivalents.
// This keeps the wallet understandable while the source of truth remains the
// exact Rial cost calculated from the provider's actual token usage.
const MODEL_PRICING_USD_PER_MILLION: Record<string, { input: number; output: number }> = {
  "google/gemini-3.1-flash-lite": { input: 0.25, output: 1.5 }
};
const DEFAULT_PRICING = MODEL_PRICING_USD_PER_MILLION["google/gemini-3.1-flash-lite"];

export function getAiEconomicsConfig() {
  return {
    allocationRatio: ALLOCATION_RATIO,
    rateSource: "iran-market",
    configured: true,
    userCreditUnit: "output-token-equivalent"
  };
}

function getModelPricing(model: string) {
  return MODEL_PRICING_USD_PER_MILLION[model] || DEFAULT_PRICING;
}

function calculateProviderCostUsd(model: string, promptTokens: number, completionTokens: number) {
  const pricing = getModelPricing(model);
  return (promptTokens * pricing.input + completionTokens * pricing.output) / 1_000_000;
}

export function costToAiCreditTokens(model: string, costUsd: number): number {
  const pricing = getModelPricing(model);
  if (!Number.isFinite(costUsd) || costUsd <= 0 || pricing.output <= 0) return 0;
  return Math.ceil((costUsd / (pricing.output / 1_000_000)));
}

export function estimateAiCreditTokens(walletToman: number, usdToTomanRate: number, model = "google/gemini-3.1-flash-lite") {
  const pricing = getModelPricing(model);
  if (!Number.isFinite(walletToman) || walletToman <= 0 || !Number.isFinite(usdToTomanRate) || usdToTomanRate <= 0 || pricing.output <= 0) return 0;
  const usdBudget = walletToman / usdToTomanRate;
  return Math.floor(usdBudget / (pricing.output / 1_000_000));
}

export async function getAiWalletPresentation(userId: string, model = "google/gemini-3.1-flash-lite") {
  const user = await db.user.findUnique({ where: { id: userId }, select: { walletBalance: true } });
  const walletToman = user?.walletBalance ?? 0;
  if (walletToman <= 0) return { walletToman: 0, estimatedTokens: 0, rate: 0, rateSource: "none" };
  try {
    const fx = await getUsdToTomanRate();
    return {
      walletToman,
      estimatedTokens: estimateAiCreditTokens(walletToman, fx.rate, model),
      rate: fx.rate,
      rateSource: fx.source
    };
  } catch {
    return { walletToman, estimatedTokens: 0, rate: 0, rateSource: "unavailable" };
  }
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
  let billableTokens = 0;
  let costUsd = 0;
  let costToman = 0;
  let chargedToman = 0;

  for (const row of rows) {
    const p = row.payload as any;
    requests += 1;
    promptTokens += Number(p.promptTokens || 0);
    completionTokens += Number(p.completionTokens || 0);
    totalTokens += Number(p.totalTokens || 0);
    billableTokens += Number(p.billableTokens || 0);
    costUsd += Number(p.costUsd || 0);
    costToman += Number(p.costToman || 0);
    chargedToman += Number(p.chargedToman || 0);
  }

  return { requests, promptTokens, completionTokens, totalTokens, billableTokens, costUsd, costToman, chargedToman };
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
  const calculatedCost = calculateProviderCostUsd(input.model, promptTokens, completionTokens);
  const costUsd = Number.isFinite(input.costUsd) && input.costUsd! > 0
    ? input.costUsd!
    : reportedCost > 0
      ? reportedCost
      : calculatedCost;
  const billableTokens = costToAiCreditTokens(input.model, costUsd);

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
        billableTokens,
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

  return {
    charged,
    costToman,
    chargedToman,
    costUsd,
    promptTokens,
    completionTokens,
    totalTokens,
    billableTokens,
    usdToTomanRate: rate,
    rateSource
  };
}

export async function getAiWallet(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { walletBalance: true } });
  return user?.walletBalance ?? 0;
}

export function allocationFromPayment(amountToman: number): number {
  return Math.floor(Math.max(0, amountToman) * ALLOCATION_RATIO);
}
