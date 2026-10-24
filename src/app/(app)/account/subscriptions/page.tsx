import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, formatNum } from "@/lib/utils";
import { AppNav } from "@/components/app/AppNav";
import { BackButton } from "@/components/app/BackButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "تاریخچه پرداخت و اشتراک" };
const PLAN_LABELS: Record<string, string> = { free: "رایگان", pro: "رشد", business: "حرفه‌ای" };
const STATUS: Record<string, string> = { paid: "تایید شده", pending: "در انتظار بررسی رسید", pending_payment: "در انتظار پرداخت", rejected: "رسید رد شده", manual: "تغییر دستی پلن", failed: "ناموفق" };

export default async function SubscriptionsPage() {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const subscriptions = await db.subscription.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 200 });
  const paidTotal = subscriptions.filter(s => s.status === "paid").reduce((sum, x) => sum + x.amount, 0);
  return <><AppNav current="account" /><div className="container-tight py-10 space-y-6" dir="rtl"><div className="flex items-center justify-between gap-4"><BackButton href="/account" label="بازگشت به حساب من" /><div className="text-right"><h1 className="h2">تاریخچه پرداخت و اشتراک</h1><p className="muted mt-1 text-sm">وضعیت کامل خرید، رسید و فعال‌سازی پلن</p></div></div><div className="grid gap-4 sm:grid-cols-3"><div className="card p-5"><div className="text-xs text-slate-500">کل تراکنش‌ها</div><div className="mt-2 text-xl font-black">{formatNum(subscriptions.length)}</div></div><div className="card p-5"><div className="text-xs text-slate-500">تایید شده</div><div className="mt-2 text-xl font-black">{formatNum(subscriptions.filter(s => s.status === "paid").length)}</div></div><div className="card p-5"><div className="text-xs text-slate-500">مجموع پرداختی</div><div className="mt-2 text-xl font-black">{paidTotal.toLocaleString("fa-IR")} تومان</div></div></div><div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-xs"><tr><th className="px-3 py-3 text-right">تاریخ</th><th className="px-3 py-3 text-right">پلن</th><th className="px-3 py-3 text-right">مبلغ</th><th className="px-3 py-3 text-right">وضعیت</th><th className="px-3 py-3 text-right">تاریخ تایید</th><th className="px-3 py-3 text-right">انقضا</th></tr></thead><tbody>{subscriptions.map(s => <tr key={s.id} className="border-t border-slate-100"><td className="px-3 py-2 text-xs">{formatDate(s.createdAt)}</td><td className="px-3 py-2">{PLAN_LABELS[s.plan] || s.plan}</td><td className="px-3 py-2">{s.amount.toLocaleString("fa-IR")} تومان</td><td className="px-3 py-2"><span className={`rounded px-2 py-0.5 text-xs ${s.status === "paid" ? "bg-emerald-50 text-emerald-700" : s.status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{STATUS[s.status] || s.status}</span></td><td className="px-3 py-2 text-xs">{s.paidAt ? formatDate(s.paidAt) : "—"}</td><td className="px-3 py-2 text-xs">{s.expiresAt ? formatDate(s.expiresAt) : "—"}</td></tr>)}{subscriptions.length === 0 && <tr><td colSpan={6} className="p-6 text-center muted">تراکنشی ثبت نشده است.</td></tr>}</tbody></table></div></div></div></>;
}
