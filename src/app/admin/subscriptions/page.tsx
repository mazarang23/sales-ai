import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ConfirmSubscription } from "@/components/admin/ConfirmSubscription";
import Link from "next/link";

export const dynamic = "force-dynamic";
const LABELS: Record<string, string> = { pro: "رشد", business: "حرفه‌ای" };

export default async function AdminSubscriptionsPage() {
  const items = await db.subscription.findMany({ where: { status: "pending" }, orderBy: { createdAt: "desc" }, take: 100, include: { user: { select: { phone: true, name: true } } } });
  return <div className="space-y-6" dir="rtl">
    <div><h1 className="h2">پرداخت‌های در انتظار تایید</h1><p className="muted mt-1 text-sm">شماره پیگیری و رسید واریز کاربران اینجا برای بررسی ادمین نمایش داده می‌شود.</p></div>
    <div className="card overflow-hidden"><table className="w-full text-sm"><thead className="bg-slate-50 text-xs"><tr><th className="px-3 py-3 text-right">کاربر</th><th className="px-3 py-3 text-right">پلن</th><th className="px-3 py-3 text-right">مبلغ</th><th className="px-3 py-3 text-right">شماره پیگیری</th><th className="px-3 py-3 text-right">رسید</th><th className="px-3 py-3 text-right">تاریخ</th><th className="px-3 py-3 text-right"></th></tr></thead><tbody>
      {items.map(s => { const reference = s.authority?.startsWith("manual:") ? s.authority.slice(7) : "—"; const proof = s.refId?.startsWith("proof:") ? s.refId.slice(6) : null; return <tr key={s.id} className="border-t border-slate-100"><td className="px-3 py-3"><div className="font-medium">{s.user.name || "بدون نام"}</div><div className="text-xs text-slate-500" dir="ltr">{s.user.phone}</div></td><td className="px-3 py-3">{LABELS[s.plan] || s.plan}</td><td className="px-3 py-3">{s.amount.toLocaleString("fa-IR")} تومان</td><td className="px-3 py-3 font-mono text-xs" dir="ltr">{reference}</td><td className="px-3 py-3">{proof ? <Link href={`/api/admin/subscriptions/${s.id}/proof`} target="_blank" className="text-brand-600">مشاهده رسید</Link> : "—"}</td><td className="px-3 py-3 text-xs">{formatDate(s.createdAt)}</td><td className="px-3 py-3"><ConfirmSubscription subscriptionId={s.id} /></td></tr>; })}
      {items.length === 0 && <tr><td colSpan={7} className="p-8 text-center muted">پرداخت در انتظاری نیست.</td></tr>}
    </tbody></table></div>
  </div>;
}
