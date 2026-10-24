import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PLANS } from "@/lib/plans";
import { BackButton } from "@/components/app/BackButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "خرید و تمدید پلن" };

export default async function UpgradePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/upgrade");
  const currentExpiry = user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString("fa-IR") : null;

  return (
    <div className="container-tight py-10 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <BackButton href="/account" label="بازگشت به حساب من" />
        <div className="text-right">
          <h1 className="h2">خرید و تمدید پلن</h1>
          <p className="muted mt-1 text-sm">پرداخت فعلاً به‌صورت کارت‌به‌کارت و با بررسی رسید انجام می‌شود.</p>
        </div>
      </div>
      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-900">بعد از انتخاب پلن، وارد صفحه پرداخت می‌شوی؛ اطلاعات حساب را می‌بینی، واریز می‌کنی و رسید را همان‌جا بارگذاری می‌کنی. پلن فقط بعد از تایید ادمین فعال می‌شود.</div>
      <div className="grid gap-5 md:grid-cols-2">
        {(["pro", "business"] as const).map(key => {
          const plan = PLANS[key];
          const active = user.plan === key && user.planExpiresAt && new Date(user.planExpiresAt) > new Date();
          return <div key={key} className={`card p-6 flex flex-col ${key === "pro" ? "ring-2 ring-brand-500" : ""}`}>
            <div className="font-black text-xl">پلن {plan.label}</div>
            <div className="mt-2 text-3xl font-black">{plan.price.toLocaleString("fa-IR")} <span className="text-sm font-normal muted">تومان / ماه</span></div>
            <p className="muted mt-2 text-sm">{plan.tagline}</p>
            <ul className="mt-5 space-y-2 text-sm flex-1">{plan.features.map(feature => <li key={feature}>✓ {feature}</li>)}</ul>
            {active && <div className="mt-5 text-xs text-emerald-700">پلن فعلی؛ انقضا: {currentExpiry}</div>}
            <form action="/api/payments/manual" method="post" className="mt-5"><input type="hidden" name="plan" value={key} /><button className="btn-primary w-full py-3">{active ? `تمدید پلن ${plan.label}` : `ادامه پرداخت پلن ${plan.label}`}</button></form>
          </div>;
        })}
      </div>
    </div>
  );
}
