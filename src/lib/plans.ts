export type Plan = "free" | "pro" | "business";

export const PLANS: Record<Plan, {
  label: string;
  price: number;
  maxRows: number;
  aiQuestions: number;      // تعداد سوال AI در ماه (assistant)
  explainLimit: number;     // تعداد «توضیح بیشتر» در ماه
  growthPlans: number;      // تعداد برنامه رشد
  model: string;            // مدل AI
  features: string[];
  tagline: string;          // پیام بازاریابی
  support: string;          // placeholder (بدون داده)
}> = {
  free: {
    label: "رایگان",
    price: 0,
    maxRows: 5000,
    aiQuestions: 1,
    explainLimit: 1,
    growthPlans: 1,
    model: "openrouter/free",
    tagline: "شروع کن، ارزش را ببین. بدون کارت بانکی.",
    support: "",
    features: [
      "آپلود تا ۵٬۰۰۰ ردیف",
      "داشبورد اولیه + تحلیل RFM",
      "تحلیل کوهورت",
      "۱ سوال از دستیار هوشمند",
      "۱ برنامه رشد",
      "۱ توضیح بیشتر روی پیشنهاد"
    ]
  },
  pro: {
    label: "رشد",
    price: 890000,
    maxRows: 50000,
    aiQuestions: 50,
    explainLimit: 20,
    growthPlans: 20,
    model: "openrouter/free",
    tagline: "برای فروشگاهی که جدی است.",
    support: "",
    features: [
      "آپلود تا ۵۰٬۰۰۰ ردیف",
      "تحلیل کامل RFM و کوهورت",
      "۵۰ سوال از دستیار هوشمند در ماه",
      "۲۰ برنامه رشد",
      "۲۰ توضیح بیشتر روی پیشنهاد",
      "خروجی PDF"
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
    tagline: "کیفیت یک تیم مارکتینگ داخلی، با کسری از هزینه.",
    support: "",
    features: [
      "آپلود تا ۵۰۰٬۰۰۰ ردیف",
      "همه‌چیز در پلن رشد",
      "۵۰۰ سوال از دستیار هوشمند در ماه",
      "مدل AI حرفه‌ای (Gemini)",
      "۱۰۰ توضیح بیشتر روی پیشنهاد",
      "برنامه رشد نامحدود",
      "اولویت در رزرو مشاورین"
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