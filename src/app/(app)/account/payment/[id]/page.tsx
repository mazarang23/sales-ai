import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";
import { getPaymentInfo } from "@/lib/payment-info";
import { ManualPaymentForm } from "@/components/app/ManualPaymentForm";
import { BackButton } from "@/components/app/BackButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "پرداخت دستی" };

const STATUS: Record<string, string> = {
  pending_payment: "در انتظار پرداخت",
  pending: "در انتظار بررسی رسید",
  paid: "پرداخت تایید شده",
  rejected: "رسید رد شده"
};

export default async function ManualPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/account/payment/${id}`);
  const subscription = await db.subscription.findUnique({ where: { id } });
  if (!subscription || subscription.userId !== user.id) notFound();

  const plan = PLANS[subscription.plan as "pro" | "business"];
  if (!plan) notFound();
  const info = await getPaymentInfo();
  const submitted = ["pending", "paid"].includes(subscription.status);

  return (
    <div className="container-tight py-10 max-w-4xl" dir="rtl">
      <BackButton href="/account/upgrade" label="بازگشت به خرید و تمدید" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="card overflow-hidden">
          <div className="bg-slate-950 p-7 text-white relative">
            <div className="absolute -left-10 -top-12 h-40 w-40 rounded-full bg-brand-500/30 blur-2xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-white/60">فروش‌یار · پرداخت امن دستی</div>
                <div className="mt-8 text-3xl font-black tracking-tight">{plan.label}</div>
                <div className="mt-2 text-sm text-white/70">اشتراک یک‌ماهه</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left backdrop-blur">
                <div className="text-[10px] text-white/50">مبلغ قابل پرداخت</div>
                <div className="mt-1 text-xl font-black">{subscription.amount.toLocaleString("fa-IR")}</div>
                <div className="text-[10px] text-white/50">تومان</div>
              </div>
            </div>
            <div className="relative mt-10 flex items-center justify-between text-xs text-white/60">
              <span>فروش‌یار</span><span>**** **** ****</span>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between"><h1 className="text-xl font-black">اطلاعات واریز</h1><span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{STATUS[subscription.status] || subscription.status}</span></div>
            <p className="text-sm leading-7 text-slate-600">مبلغ دقیق بالا را کارت‌به‌کارت کنید، سپس تصویر یا PDF رسید و شماره پیگیری را در فرم پایین ثبت کنید. فعال‌سازی پلن فقط بعد از تایید ادمین انجام می‌شود.</p>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 space-y-4">
              <Info label="شماره کارت" value={info.cardNumber} copy />
              <Info label="شماره شبا" value={info.shaba} copy />
              <Info label="به نام" value={info.holderName} />
              <Info label="بانک" value={info.bankName} />
            </div>
            <div className="rounded-2xl bg-amber-50 p-4 text-xs leading-6 text-amber-900">رسید را واضح بارگذاری کنید. فرمت‌های JPG، PNG، WEBP و PDF تا سقف ۵ مگابایت پذیرفته می‌شوند.</div>
          </div>
        </section>
        <section>
          {submitted ? <div className="card p-6 space-y-4"><div className="text-2xl">✓</div><h2 className="text-xl font-black">رسید شما ثبت شد</h2><p className="text-sm leading-7 text-slate-600">پرداخت در صف بررسی است. تا تایید نهایی، پلن جدید فعال نمی‌شود.</p><div className="rounded-2xl bg-slate-50 p-4 text-sm">وضعیت فعلی: <strong>{STATUS[subscription.status]}</strong></div></div> : <ManualPaymentForm subscriptionId={subscription.id} />}
          <div className="mt-4 text-xs leading-6 text-slate-500">شناسه پیگیری داخلی: <span className="font-mono" dir="ltr">{subscription.id}</span></div>
        </section>
      </div>
    </div>
  );
}

function Info({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return <div className="flex items-center justify-between gap-4"><div><div className="text-xs text-slate-500">{label}</div><div className="mt-1 font-bold" dir={label === "به نام" || label === "بانک" ? "rtl" : "ltr"}>{value}</div></div>{copy && <span className="text-[10px] text-slate-400">قابل کپی</span>}</div>;
}
