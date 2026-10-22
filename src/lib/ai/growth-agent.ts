import OpenAI from "openai";
import { z } from "zod";

const ActionSchema = z.object({
  title: z.string().min(1).max(200),
  cost: z.union([z.string(), z.number()]).transform(v => String(v)),
  eta: z.string().min(1).max(100),
  impact: z.string().min(1).max(200),
  reasoning: z.string().max(500).optional()
});
const PlanSchema = z.object({ actions: z.array(ActionSchema).min(1).max(6) });
const ExplainSchema = z.object({
  details: z.string().min(20).max(5000),
  steps: z.array(z.string().min(3).max(300)).min(2).max(10)
});
export type GrowthAction = z.infer<typeof ActionSchema>;
export type ActionExplanation = z.infer<typeof ExplainSchema>;

function createClient(): OpenAI | null {
  const provider = process.env.AI_PROVIDER || "openrouter";
  if (provider !== "openrouter") return process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  const key = process.env.OPENROUTER_API_KEY;
  return key ? new OpenAI({ apiKey: key, baseURL: "https://openrouter.ai/api/v1" }) : null;
}
function sanitize(input: string, max = 200): string { return String(input).slice(0, max).replace(/[\r\n]+/g, " ").trim(); }

export type GrowthInput = {
  industry: string;
  kpis: { total: number; customers: number; orders: number; aov: number };
  topProducts: { name: string; amount: number; count: number }[];
  segments: { Champions: number; Loyal: number; Potential: number; AtRisk: number; Lost: number };
  dateRange: { from: string; to: string };
  model?: string;
};
export type AiCallUsage = { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number; cost?: number };

export async function growthPlan(input: GrowthInput): Promise<{ actions: GrowthAction[]; source: "ai" | "fallback"; usage?: AiCallUsage }> {
  const client = createClient();
  if (!client) return { source: "fallback", actions: fallbackActions() };
  const industry = sanitize(input.industry, 60);
  const topList = input.topProducts.slice(0, 5).map(p => `- ${sanitize(p.name, 60)}: ${Math.round(p.amount)} / ${p.count}`).join("\n");
  const seg = input.segments;
  const prompt = `نقش: مشاور رشد فروش در صنعت «${industry}».
با داده‌های زیر یک برنامه رشد عملیاتی و واقع‌بینانه بساز.
بازه ${input.dateRange.from} تا ${input.dateRange.to}; فروش ${Math.round(input.kpis.total)}؛ مشتری ${input.kpis.customers}؛ سفارش ${input.kpis.orders}؛ میانگین سبد ${Math.round(input.kpis.aov)}.
RFM: Champions=${seg.Champions}, Loyal=${seg.Loyal}, Potential=${seg.Potential}, AtRisk=${seg.AtRisk}, Lost=${seg.Lost}.
محصولات برتر:
${topList || "نامشخص"}
سه اقدام فوری ۱-۲ هفته‌ای و دو اقدام میان‌مدت ۱-۲ ماهه بده. هر اقدام title,cost,eta,impact,reasoning داشته باشد. فقط JSON بده.`;
  const model = input.model || "openrouter/free";
  try {
    const r = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_schema", json_schema: { name: "growth_plan", strict: true, schema: {
        type: "object", properties: { actions: { type: "array", items: { type: "object", properties: {
          title: { type: "string" }, cost: { type: "string" }, eta: { type: "string" }, impact: { type: "string" }, reasoning: { type: "string" }
        }, required: ["title", "cost", "eta", "impact"], additionalProperties: false } } }, required: ["actions"], additionalProperties: false
      } } },
      temperature: 0.25,
      max_tokens: 1800,
      usage: { include: true } as any
    } as any, { timeout: 90000 });
    const choice = r.choices[0];
    const text = choice?.message?.content || "";
    if (!text.trim() || choice?.finish_reason === "length") return { source: "fallback", actions: fallbackActions(), usage: r.usage as any };
    return { source: "ai", actions: PlanSchema.parse(JSON.parse(text)).actions, usage: r.usage as any };
  } catch (e) {
    console.error("growthPlan error:", e);
    return { source: "fallback", actions: fallbackActions() };
  }
}

export async function explainAction(action: GrowthAction, context: { industry: string; kpis: { total: number; customers: number; orders: number; aov: number }; model: string }): Promise<{ explanation: ActionExplanation | null; usage?: AiCallUsage }> {
  const client = createClient();
  if (!client) return { explanation: null };
  const model = context.model || "openrouter/free";
  const prompt = `نقش: مشاور رشد در «${sanitize(context.industry, 60)}».
اقدام: ${sanitize(action.title, 180)}؛ هزینه: ${sanitize(action.cost, 80)}؛ زمان: ${sanitize(action.eta, 80)}؛ اثر: ${sanitize(action.impact, 180)}؛ دلیل: ${sanitize(action.reasoning || "—", 220)}.
داده زمینه: فروش ${Math.round(context.kpis.total)}، مشتری ${context.kpis.customers}، سفارش ${context.kpis.orders}، میانگین سبد ${Math.round(context.kpis.aov)}.
توضیح را کاربردی و کوتاه بده. فقط JSON با details و steps.`;
  try {
    const r = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_schema", json_schema: { name: "action_explanation", strict: true, schema: {
        type: "object", properties: { details: { type: "string" }, steps: { type: "array", items: { type: "string" } } }, required: ["details", "steps"], additionalProperties: false
      } } },
      temperature: 0.25,
      max_tokens: 900,
      usage: { include: true } as any
    } as any, { timeout: 90000 });
    const choice = r.choices[0];
    const text = choice?.message?.content || "";
    if (!text.trim() || choice?.finish_reason === "length") return { explanation: null, usage: r.usage as any };
    return { explanation: ExplainSchema.parse(JSON.parse(text)), usage: r.usage as any };
  } catch (e) { console.error("explainAction error:", e); return { explanation: null }; }
}

function fallbackActions(): GrowthAction[] {
  return [
    { title: "کمپین بازگشت مشتریان غیرفعال", cost: "۲ تا ۵ میلیون تومان", eta: "۱ هفته", impact: "تمرکز بر بازگشت مشتریان غیرفعال", reasoning: "بر اساس سگمنت AtRisk" },
    { title: "بسته‌بندی محصولات پرفروش", cost: "۱ تا ۳ میلیون تومان", eta: "۲ هفته", impact: "افزایش احتمال خرید ترکیبی", reasoning: "بر اساس محصولات برتر" },
    { title: "باشگاه مشتریان VIP", cost: "۵۰۰ هزار تومان", eta: "۲ هفته", impact: "تقویت تکرار خرید مشتریان وفادار", reasoning: "بر اساس سگمنت Champions" }
  ];
}
