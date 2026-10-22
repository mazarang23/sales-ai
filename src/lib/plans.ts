export type Plan = "free" | "pro" | "business";

export const PLANS: Record<Plan, {
  label: string;
  price: number;
  maxRows: number;
  aiQuestions: number;
  explainLimit: number;
  growthPlans: number;
  model: string;
  features: string[];
  tagline: string;
  support: string;
}> = {
  free: {
    label: "شروع",
    price: 0,
    maxRows: 5000,
    aiQuestions: 5,
    explainLimit: 3,
    growthPlans: 3,
    model: "openrouter/free",
    tagline: "فروشیار را روی کسب‌وکارت امتحان کن.",
    support: "پشتیبانی پایه",
    features: [
      "راه‌اندازی رایگان",
      "آپلود تا ۵٬۰۰۰ ردیف فروش",
      "داشبورد فروش و مشتریان",
      "۵ سؤال از دستیار هوشمند",
      "۳ پیشنهاد رشد"
    ]
  },
  pro: {
    label: "رشد",
    price: 890000,
    maxRows: 50000,
    aiQuestions: 100,
    explainLimit: 30,
    growthPlans: 30,
    model: "openrouter/free",
    tagline: "برای کسب‌وکاری که می‌خواهد فروش را جدی‌تر دنبال کند.",
    support: "پشتیبانی اولویت‌دار",
    features: [
      "تا ۵۰٬۰۰۰ ردیف فروش",
      "تحلیل کامل مشتری و محصول",
      "۱۰۰ سؤال از دستیار هوشمند",
      "۳۰ برنامه رشد",
      "گزارش PDF",
      "پشتیبانی اولویت‌دار"
    ]
  },
  business: {
    label: "حرفه‌ای",
    price: 4900000,
    maxRows: 500000,
    aiQuestions: 500,
    explainLimit: 100,
    growthPlans: 99999,
    model: "google/gemini-3.5-flash-lite",
    tagline: "یک نیروی فروش هوشمند برای کسب‌وکار حرفه‌ای.",
    support: "پشتیبانی اختصاصی",
    features: [
      "تا ۵۰۰٬۰۰۰ ردیف فروش",
      "همه امکانات پلن رشد",
      "۵۰۰ سؤال از دستیار هوشمند",
      "مدل هوش مصنوعی حرفه‌ای",
      "برنامه رشد نامحدود",
      "اولویت در خدمات مشاوره"
    ]
  }
};

export function getPlan(userPlan: string): Plan {
  if (userPlan === "pro" || userPlan === "business") return userPlan;
  return "free";
}

export function getMaxRows(userPlan: string): number {
  return PLANS[getPlan(userPlan)].maxRows;
}

export function getAiQuestionsLimit(userPlan: string): number {
  return PLANS[getPlan(userPlan)].aiQuestions;
}

export function getExplainLimit(userPlan: string): number {
  return PLANS[getPlan(userPlan)].explainLimit;
}

export function getGrowthPlansLimit(userPlan: string): number {
  return PLANS[getPlan(userPlan)].growthPlans;
}

export function getModelForPlan(plan: string): string {
  return PLANS[getPlan(plan)].model;
}
