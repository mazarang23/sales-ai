import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OnlinePayButton } from "@/components/app/OnlinePayButton";
import { PlanPaymentForm } from "@/components/app/PlanPaymentForm";
import { getPaymentInfo } from "@/lib/payment-info";
import { PLANS } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UpgradePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const info = await getPaymentInfo();

  return (
    <div className="container-tight py-10 space-y-6" dir="rtl">
      <div>
        <h1 className="h2">خرید یا ارتقای پلن</h1>
        <p className="muted mt-1 text-sm">
          پلن فعلی: <span className="font-medium">{PLANS[user.plan as keyof typeof PLANS]?.label || "رایگان"}</span>
          {user.planExpiresAt && ` — تا ${formatDate(user.planExpiresAt)}`}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {(["pro", "business"] as const).map(planKey => {
          const p = PLANS[planKey];
          const isCurrent = user.plan === planKey;
          return (
            <div
              key={planKey}
              className={`card p-6 flex flex-col ${planKey === "pro" ? "ring-2 ring-brand-500" : ""}`}
            >
              {planKey === "pro" && (
                <div className="mb-3 inline-block rounded-full bg-brand-600 px-3 py-1 text-xs text-white w-fit">
                  پیشنهاد ما
                </div>
              )}
              <div className="font-bold text-lg">{p.label}</div>
              <div className="mt-3">
                <span className="text-2xl font-black">{p.price.toLocaleString("fa-IR")}</span>
                <span className="muted mr-1 text-sm"> تومان / ماه</span>
              </div>
              {p.tagline && <p className="muted text-sm mt-2">{p.tagline}</p>}
              <ul className="mt-6 space-y-2 text-sm flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-emerald-600 shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {isCurrent ? (
                  <div className="btn-ghost w-full text-center opacity-60">فعال</div>
                ) : (
                  <PlanPaymentForm plan={planKey} amount={p.price} info={info} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}