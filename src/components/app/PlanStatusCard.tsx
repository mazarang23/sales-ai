import Link from "next/link";
import { formatIRR, formatNum, formatDate } from "@/lib/utils";

const PLAN_LABELS: Record<string, string> = {
  free: "رایگان",
  pro: "رشد",
  business: "حرفه‌ای"
};

export function PlanStatusCard({
  plan,
  planExpiresAt,
  aiQuestionsUsed,
  aiQuestionsLimit,
  walletBalance
}: {
  plan: string;
  planExpiresAt: Date | null;
  aiQuestionsUsed: number;
  aiQuestionsLimit: number;
  walletBalance: number;
}) {
  const now = new Date();
  const active = planExpiresAt && planExpiresAt > now;
  const daysLeft = active
    ? Math.ceil((planExpiresAt!.getTime() - now.getTime()) / 86400000)
    : 0;
  const questionsLeft = Math.max(0, aiQuestionsLimit - aiQuestionsUsed);

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm text-slate-500">پلن فعلی</div>
          <div className="mt-1 text-2xl font-black">
            {PLAN_LABELS[plan] || plan}
          </div>
          {plan !== "free" && (
            <div className="text-sm text-slate-600 mt-1">
              {active
                ? `${formatNum(daysLeft)} روز باقی‌مانده (تا ${formatDate(planExpiresAt)})`
                : "پلن منقضی شده — لطفاً تمدید کنید"}
            </div>
          )}
        </div>
        <Link href="/account/upgrade" className="btn-primary text-sm">
          {plan === "free" ? "خرید پلن" : active ? "تمدید یا ارتقا" : "تمدید"}
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-xs text-slate-500">سوالات AI باقی‌مانده</div>
          <div className="mt-1 text-lg font-bold">
            {formatNum(questionsLeft)} از {formatNum(aiQuestionsLimit)}
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-xs text-slate-500">سوالات مصرف‌شده</div>
          <div className="mt-1 text-lg font-bold">{formatNum(aiQuestionsUsed)}</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-xs text-slate-500">کیف پول</div>
          <div className="mt-1 text-lg font-bold">{formatIRR(walletBalance)}</div>
        </div>
      </div>
    </div>
  );
}
