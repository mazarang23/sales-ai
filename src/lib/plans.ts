export type Plan = "free" | "pro" | "business";

export const PLANS: Record<Plan, {
  label: string;
  price: number;
  maxRows: number;
  maxUploads: number;
  aiQuestions: number;
  explainLimit: number;
  growthPlans: number;
  model: string;
  features: string[];
  tagline: string;
  support: string;
}> = {
  free: {
    label: "رایگان", price: 0, maxRows: 5000, maxUploads: 5, aiQuestions: 5, explainLimit: 5, growthPlans: 5,
    model: "openrouter/free", tagline: "برای اینکه با داده واقعی فروشگاهت شروع کنی؛ بدون کارت بانکی.", support: "",
    features: ["تا ۵ فایل فروش", "هر فایل تا ۵٬۰۰۰ ردیف", "داشبورد اولیه + تحلیل RFM", "تحلیل کوهورت", "۵ سوال از دستیار هوشمند در ماه", "۵ برنامه رشد در ماه", "۵ توضیح بیشتر روی پیشنهاد در ماه"]
  },
  pro: {
    label: "رشد", price: 890000, maxRows: 50000, maxUploads: 999999, aiQuestions: 50, explainLimit: 20, growthPlans: 20,
    model: "google/gemini-3.1-flash-lite", tagline: "برای فروشگاهی که می‌خواهد تصمیم‌ها را با داده بگیرد.", support: "",
    features: ["آپلود فایل تا ۵۰٬۰۰۰ ردیف", "تحلیل کامل RFM و کوهورت", "۵۰ سوال از دستیار هوشمند در ماه", "۲۰ برنامه رشد در ماه", "۲۰ توضیح بیشتر روی پیشنهاد در ماه", "خروجی PDF گزارش تحلیل"]
  },
  business: {
    label: "حرفه‌ای", price: 4900000, maxRows: 500000, maxUploads: 999999, aiQuestions: 500, explainLimit: 100, growthPlans: 99999,
    model: "google/gemini-3.1-flash-lite", tagline: "تحلیل عمیق‌تر برای تیم‌هایی که فروش را جدی مدیریت می‌کنند.", support: "",
    features: ["آپلود فایل تا ۵۰۰٬۰۰۰ ردیف", "همه امکانات پلن رشد", "۵۰۰ سوال از دستیار هوشمند در ماه", "مدل AI پیشرفته Gemini", "۱۰۰ توضیح بیشتر روی پیشنهاد در ماه", "برنامه رشد بدون سقف عملیاتی ماهانه", "اولویت در رزرو مشاورین"]
  }
};
export function getPlan(userPlan: string): Plan { return userPlan === "pro" || userPlan === "business" ? userPlan : "free"; }
export function getEffectivePlan(user: { plan: string; planExpiresAt?: Date | string | null }): Plan {
  const plan = getPlan(user.plan);
  if (plan === "free") return "free";
  if (!user.planExpiresAt || new Date(user.planExpiresAt).getTime() <= Date.now()) return "free";
  return plan;
}
export function getMaxRows(userPlan: string): number { return PLANS[getPlan(userPlan)].maxRows; }
export function getAiQuestionsLimit(userPlan: string): number { return PLANS[getPlan(userPlan)].aiQuestions; }
export function getExplainLimit(userPlan: string): number { return PLANS[getPlan(userPlan)].explainLimit; }
export function getGrowthPlansLimit(userPlan: string): number { return PLANS[getPlan(userPlan)].growthPlans; }
export function getModelForPlan(plan: string): string { return PLANS[getPlan(plan)].model; }
