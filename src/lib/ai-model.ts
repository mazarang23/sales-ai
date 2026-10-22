export type Plan = "free" | "pro" | "business";

/**
 * انتخاب مدل بر اساس پلن:
 * - free و pro: Free Models Router (openrouter/free)
 * - business: Gemini 3.5 Flash-Lite through OpenRouter
 */
export function getModelForPlan(plan: string): string {
  if (plan === "business") {
    return "google/gemini-3.5-flash-lite";
  }
  return "openrouter/free";
}

export function getPlanLabel(plan: string): string {
  if (plan === "business") return "حرفه‌ای";
  if (plan === "pro") return "رشد";
  return "رایگان";
}