import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatIRR, formatDate, formatNum } from "@/lib/utils";
import { AppNav } from "@/components/app/AppNav";
import { BackButton } from "@/components/app/BackButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "تاریخچه پرداخت و اشتراک" };

const PLAN_LABELS: Record<string, string> = { free: "رایگان", pro: "رشد", business: "حرفه‌ای" };

export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<{ payment?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const params = await searchParams;

  const subscriptions = await db.subscription.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 200 });
  const paidTotal = subscriptions.filter(s => s.status === "paid").reduce((s, x) => s + x.amount, 0);
  const paymentMessage = params.payment === "success" ? { text: "پرداخت با موفقیت تأیید شد و پلن شما فعال شد.", cls: "border-emerald-200 bg-emerald-50 text-emerald-800" }
    : params.payment === "cancelled" ? { text: "پرداخت لغو شد و هیچ پلنی فعال نشد.", cls: "border-amber-200 bg-amber-50 text-amber-800" }
    : params.payment ? { text: "پرداخت تأیید نشد. در صورت کسر وجه، وضعیت تراکنش را بررسی کنید.", cls: "border-red-200 bg-red-50 text-red-800" } : null;

  return <><AppNav current="account" /><div className="container-tight py-10 space-y-6" dir="rtl">
    <div className="flex items-center justify-between gap-4"><BackButton href="/account" label="بازگشت به حساب من" /><div className="text-right"><h1 className="h2">تاریخچه پرداخت و اشتراک</h1><p className="muted mt-1 text-sm">همه پرداخت‌های درگاه و تغییرات ثبت‌شده پلن</p></div></div>
    {paymentMessage && <div className={`rounded-2xl border p-4 text-sm ${paymentMessage.cls}`}>{paymentMessage.text}</div>}
    <div className="grid gap-4 sm:grid-cols-3"><div className="card p-5"><div className="text-xs text-slate-500">کل تراکنش‌ها</div><div className="mt-2 text-xl font-black">{formatNum(subscriptions.length)}</div></div><div className="card p-5"><div className="text-xs text-slate-500">پرداخت‌شده</div><div className="mt-2 text-xl font-black">{formatNum(subscriptions.filter(s => s.status === "paid").length)}</div></div><div className="card p-5"><div className="text-xs text-slate-500">مجموع پرداختی</div><div className="mt-2 text-xl font-black">{formatIRR(paidTotal)}</div></div></div>
    <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-xs"><tr><th className="px-3 py-3 text-right">تاریخ</th><th className="px-3 py-3 text-right">پلن</th><th className="px-3 py-3 text-right">مبلغ</th><th className="px-3 py-3 text-right">وضعیت</th><th className="px-3 py-3 text-right">تاریخ پرداخت</th><th className="px-3 py-3 text-right">انقضا</th></tr></thead><tbody>{subscriptions.map(s => <tr key={s.id} className="border-t border-slate-100"><td className="px-3 py-2 text-xs">{formatDate(s.createdAt)}</td><td className="px-3 py-2">{PLAN_LABELS[s.plan] || s.plan}</td><td className="px-3 py-2">{s.status === "manual" ? "—" : formatIRR(s.amount)}</td><td className="px-3 py-2"><span className={`rounded px-2 py-0.5 text-xs ${s.status === "paid" ? "bg-emerald-50 text-emerald-700" : s.status === "pending" ? "bg-amber-50 text-amber-700" : s.status === "manual" ? "bg-slate-100 text-slate-700" : "bg-red-50 text-red-700"}`}>{s.status === "paid" ? "پرداخت شده" : s.status === "pending" ? "در انتظار" : s.status === "manual" ? "تغییر دستی پلن" : "ناموفق"}</span></td><td className="px-3 py-2 text-xs">{s.paidAt ? formatDate(s.paidAt) : "—"}</td><td className="px-3 py-2 text-xs">{s.expiresAt ? formatDate(s.expiresAt) : "—"}</td></tr>)}{subscriptions.length === 0 && <tr><td colSpan={6} className="p-6 text-center muted">تراکنشی ثبت نشده است.</td></tr>}</tbody></table></div></div>
  </div></>;
}
