import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PLANS } from "@/lib/plans";
import { BackButton } from "@/components/app/BackButton";
import { isZarinpalConfigured } from "@/lib/payments/zarinpal";

export const dynamic = "force-dynamic";
export const metadata = { title: "خرید و تمدید پلن" };

export default async function UpgradePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/upgrade");

  const gatewayReady = isZarinpalConfigured();
  const currentExpiry = user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString("fa-IR") : null;

  return (
    <div className="container-tight py-10 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <BackButton href="/account" label="بازگشت به حساب من" />
        <div className="text-right">
          <h1 className="h2">خرید و تمدید پلن</h1>
          <p className="muted mt-1 text-sm">پرداخت فقط از طریق درگاه امن زرین‌پال انجام می‌شود.</p>
        </div>
      </div>

      {!gatewayReady && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          درگاه پرداخت هنوز روی محیط سایت تنظیم نشده است. بعد از ثبت Merchant ID زرین‌پال، دکمه‌های پرداخت فعال می‌شوند.
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {(["pro", "business"] as const).map(key => {
          const plan = PLANS[key];
          const active = user.plan === key && user.planExpiresAt && new Date(user.planExpiresAt) > new Date();
          return (
            <div key={key} className={`card p-6 flex flex-col ${key === "pro" ? "ring-2 ring-brand-500" : ""}`}>
              <div className="font-black text-xl">پلن {plan.label}</div>
              <div className="mt-2 text-3xl font-black">{plan.price.toLocaleString("fa-IR")} <span className="text-sm font-normal muted">تومان / ماه</span></div>
              <p className="muted mt-2 text-sm">{plan.tagline}</p>
              <ul className="mt-5 space-y-2 text-sm flex-1">
                {plan.features.map(feature => <li key={feature}>✓ {feature}</li>)}
              </ul>
              {active && <div className="mt-5 text-xs text-emerald-700">پلن فعلی؛ انقضا: {currentExpiry}</div>}
              <form action="/api/payments/zarinpal/request" method="post" className="mt-5">
                <input type="hidden" name="plan" value={key} />
                <button disabled={!gatewayReady} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
                  {active ? `تمدید پلن ${plan.label}` : `پرداخت پلن ${plan.label}`}
                </button>
              </form>
            </div>
          );
        })}
      </div>

      <div className="card p-5 text-sm text-slate-600">
        <div className="font-bold text-slate-900">نکته پرداخت</div>
        <p className="mt-2">بعد از پرداخت موفق، رسید در تاریخچه تراکنش‌ها ثبت و پلن برای ۳۰ روز فعال می‌شود. پرداخت‌های قبلی حذف یا به پرداخت دستی تبدیل نمی‌شوند.</p>
      </div>
    </div>
  );
}
