import OpenAI from "openai";
import { z } from "zod";

const ActionSchema = z.object({
  title: z.string().min(1).max(200),
  cost: z.union([z.string(), z.number()]).transform(v => String(v)),
  eta: z.string().min(1).max(100),
  impact: z.string().min(1).max(200),
  reasoning: z.string().max(500).optional()
});

const PlanSchema = z.object({
  actions: z.array(ActionSchema).min(1).max(6)
});

const ExplainSchema = z.object({
  details: z.string().min(20).max(5000),
  steps: z.array(z.string().min(3).max(300)).min(2).max(10)
});

export type GrowthAction = z.infer<typeof ActionSchema>;
export type ActionExplanation = z.infer<typeof ExplainSchema>;

function createClient(): OpenAI | null {
  const provider = process.env.AI_PROVIDER || "openrouter";
  if (provider === "openrouter") {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) return null;
    return new OpenAI({ apiKey: key, baseURL: "https://openrouter.ai/api/v1" });
  }
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function sanitize(input: string, max = 200): string {
  return String(input).slice(0, max).replace(/[\r\n]+/g, " ").trim();
}

export type GrowthInput = {
  industry: string;
  kpis: { total: number; customers: number; orders: number; aov: number };
  topProducts: { name: string; amount: number; count: number }[];
  segments: { Champions: number; Loyal: number; Potential: number; AtRisk: number; Lost: number };
  dateRange: { from: string; to: string };
};

export async function growthPlan(
  input: GrowthInput & { model?: string }
): Promise<{ actions: GrowthAction[]; source: "ai" | "fallback" }> {
  // ...
  const model = input.model || "openrouter/free";
  // ...
}

  const industry = sanitize(input.industry, 60);
  const topList = input.topProducts
    .slice(0, 5)
    .map(p => `- ${sanitize(p.name, 80)}: فروش ${Math.round(p.amount)}، ${p.count} سفارش`)
    .join("\n");
  const seg = input.segments;

  const prompt = `تو یک مدیر مارکتینگ رشد خبره در حوزه «${industry}» هستی. بر اساس داده‌های زیر، یک برنامه رشد عملیاتی بده.

## داده‌ها
بازه: ${input.dateRange.from} تا ${input.dateRange.to}
KPI: فروش کل ${Math.round(input.kpis.total)}، مشتریان ${input.kpis.customers}، سفارش‌ها ${input.kpis.orders}، میانگین سبد ${Math.round(input.kpis.aov)}

سگمنت مشتریان:
- Champions: ${seg.Champions}
- Loyal: ${seg.Loyal}
- Potential: ${seg.Potential}
- AtRisk: ${seg.AtRisk}
- Lost: ${seg.Lost}

پرفروش‌ترین محصولات:
${topList || "نامشخص"}

## دستورالعمل
سه اقدام فوری (۱-۲ هفته) و دو اقدام میان‌مدت (۱-۲ ماه) بده.
هر اقدام: title, cost, eta, impact, reasoning (چرا بر اساس کدام عدد).
خروجی فقط JSON: {"actions":[{"title","cost","eta","impact","reasoning"}]}`;

  const model = process.env.AI_MODEL || "openrouter/free";

  try {
    const r = await client.chat.completions.create(
      {
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "growth_plan",
            strict: true,
            schema: {
              type: "object",
              properties: {
                actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      cost: { type: "string" },
                      eta: { type: "string" },
                      impact: { type: "string" },
                      reasoning: { type: "string" }
                    },
                    required: ["title", "cost", "eta", "impact"],
                    additionalProperties: false
                  }
                }
              },
              required: ["actions"],
              additionalProperties: false
            }
          }
        },
        temperature: 0.3,
        max_tokens: 8000
      },
      { timeout: 90000 }
    );

    const choice = r.choices[0];
    const text = choice?.message?.content || "";
    console.log("growthPlan: finish_reason:", choice?.finish_reason, "content_length:", text.length);

    if (!text.trim()) {
      console.error("growthPlan: empty content");
      return { source: "fallback", actions: fallbackActions() };
    }
    if (choice?.finish_reason === "length") {
      console.error("growthPlan: truncated by max_tokens");
      return { source: "fallback", actions: fallbackActions() };
    }

    const parsed = PlanSchema.parse(JSON.parse(text));
    return { source: "ai", actions: parsed.actions };
  } catch (e) {
    console.error("growthPlan error:", e);
    return { source: "fallback", actions: fallbackActions() };
  }
}

export async function explainAction(
  action: GrowthAction,
  context: { industry: string; kpis: { total: number; customers: number; orders: number; aov: number }; model: string }
): Promise<{ explanation: ActionExplanation | null }> {
  const client = createClient();
  if (!client) return { explanation: null };

  const model = context.model || "qwen/qwen3-next-80b-a3b-instruct:free";

  const prompt = `تو یک مشاور رشد خبره در حوزه «${sanitize(context.industry, 60)}» هستی.
کاربر می‌خواهد درباره این اقدام بیشتر بداند:
عنوان: ${sanitize(action.title, 200)}
هزینه: ${sanitize(action.cost, 100)}
زمان: ${sanitize(action.eta, 100)}
اثر: ${sanitize(action.impact, 200)}
دلیل اولیه: ${sanitize(action.reasoning || "—", 300)}

زمینه داده: فروش کل ${Math.round(context.kpis.total)}، مشتریان ${context.kpis.customers}، سفارش‌ها ${context.kpis.orders}، میانگین سبد ${Math.round(context.kpis.aov)}.

خروجی JSON:
{
  "details": "توضیح جامع ۲ تا ۴ پاراگرافی درباره این اقدام",
  "steps": ["گام ۱ عملیاتی", "گام ۲", "گام ۳"]
}`;

try {
  const r = await client.chat.completions.create(
    {
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "action_explanation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              details: { type: "string" },
              steps: { type: "array", items: { type: "string" } }
            },
            required: ["details", "steps"],
            additionalProperties: false
          }
        }
      },
      temperature: 0.4,
      max_tokens: 6000
    },
    { timeout: 90000 }
  );

  const choice = r.choices[0];
  const text = choice?.message?.content || "";
  if (!text.trim() || choice?.finish_reason === "length") {
    return { explanation: null };
  }

  const parsed = ExplainSchema.parse(JSON.parse(text));
  return { explanation: parsed };
} catch (e) {
  console.error("explainAction error:", e);
  return { explanation: null };
}
}

function fallbackActions(): GrowthAction[] {
  return [
    {
      title: "کمپین بازگشت مشتریان غیرفعال",
      cost: "۲ تا ۵ میلیون تومان",
      eta: "۱ هفته",
      impact: "بازگرداندن ۱۰ تا ۲۰ درصد مشتریان از دست رفته",
      reasoning: "بر اساس سگمنت AtRisk"
    },
    {
      title: "بسته‌بندی محصولات پرفروش",
      cost: "۱ تا ۳ میلیون تومان",
      eta: "۲ هفته",
      impact: "افزایش میانگین سبد خرید تا ۱۵ درصد",
      reasoning: "بر اساس محصولات برتر"
    },
    {
      title: "باشگاه مشتریان VIP",
      cost: "۵۰۰ هزار تومان",
      eta: "۲ هفته",
      impact: "افزایش تکرار خرید مشتریان وفادار",
      reasoning: "بر اساس سگمنت Champions"
    }
  ];
}