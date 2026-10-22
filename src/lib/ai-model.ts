export type Plan = "free" | "pro" | "business";

/**
 * انتخاب مدل بر اساس پلن:
 * - free و pro: Free Models Router (openrouter/free) - به طور خودکار یک مدل رایگان فعال انتخاب می‌کند
 * - business: Gemini 2.5 Flash Lite (پرداختی، باکیفیت برای مارکتینگ)
 */
export function getModelForPlan(plan: string): string {
  if (plan === "business") {
    return "google/gemini-2.5-flash-lite";
  }
  // free و pro
  return "openrouter/free";
}

export function getPlanLabel(plan: string): string {
  if (plan === "business") return "حرفه‌ای";
  if (plan === "pro") return "رشد";
  return "رایگان";
}