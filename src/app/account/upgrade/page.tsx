import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getPaymentInfo } from "@/lib/payment-info";
import { PLANS, Plan } from "@/lib/plans";
import { PlanPaymentForm } from "@/components/app/PlanPaymentForm";
import { AppNav } from "@/components/app/AppNav";

export const dynamic = "force-dynamic";

export default async function UpgradePage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/upgrade");
  const sp = await searchParams;
  const selected = sp.plan === "pro" || sp.plan === "business" ? sp.plan as Plan : null;
  const info = await getPaymentInfo();

  return <><AppNav current="account" /><div className="container-tight py-10 space-y-6" dir="rtl">
    <div><h1 className="h2">انتخاب پلن</h1><p className="muted mt-1 text-sm">اول پلن را انتخاب کن؛ سپس همان‌جا اطلاعات واریز و شماره پیگیری را ثبت کن.</p></div>
    <div className="grid gap-4 md:grid-cols-3">
      {(Object.entries(PLANS) as [Plan, typeof PLANS[Plan]][]).map(([key, plan]) => <div key={key} className={`card p-6 ${selected === key ? "ring-2 ring-brand-500" : ""}`}>
        <div className="text-xs text-slate-500">پلن</div><div className="mt-1 text-xl font-black">{plan.label}</div><div className="mt-2 text-sm text-slate-600">{plan.tagline}</div>
        <div className="mt-4 text-2xl font-black">{plan.price === 0 ? "رایگان" : `${plan.price.toLocaleString("fa-IR")} تومان`} </div>
        <ul className="mt-4 space-y-2 text-sm">{plan.features.slice(0, 6).map(f => <li key={f}>✓ {f}</li>)}</ul>
        {key === "free" ? <div className="mt-5 rounded-xl bg-slate-50 p-3 text-sm">پلن فعلی پایه است.</div> : <Link href={`/account/upgrade?plan=${key}`} className="btn-primary mt-5 w-full text-center">انتخاب {plan.label}</Link>}
      </div>)}
    </div>
    {selected && <div className="max-w-2xl"><div className="mb-3 font-bold">پرداخت دستی — {PLANS[selected].label}</div><PlanPaymentForm plan={selected} amount={PLANS[selected].price} info={info} /></div>}
  </div></>;
}
