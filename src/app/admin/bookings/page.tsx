import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ConfirmPayment } from "@/components/admin/ConfirmPayment";
import { ConfirmSubscription } from "@/components/admin/ConfirmSubscription";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PLAN_LABELS: Record<string, string> = {
  free: "رایگان",
  pro: "رشد",
  business: "حرفه‌ای"
};

export default async function AdminBookings() {
  const [bookings, subs] = await Promise.all([
    db.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { phone: true } },
        consultant: { select: { displayName: true, phone: true } }
      }
    }),
    db.subscription.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { phone: true, name: true } } }
    })
  ]);

  const pendingBookings = bookings.filter(b => b.paymentStatus === "pending_review");
  const pendingSubs = subs.filter(s => s.status === "pending" && s.authority?.startsWith("manual:"));

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="h2">تراکنش‌ها</h1>
        <p className="muted mt-1 text-sm">تایید پرداخت‌های دستی جلسات و پلن‌ها</p>
      </div>

      <div>
        <h2 className="font-bold mb-2">پرداخت‌های جلسه در انتظار تایید ({pendingBookings.length})</h2>
        <div className="space-y-3">
          {pendingBookings.map(b => (
            <div key={b.id} className="card p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-medium">
                    {b.user ? b.user.phone : "—"} → {b.consultant.displayName}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {formatDate(b.createdAt)} — {b.hours} ساعت — {b.amount.toLocaleString("fa-IR")} تومان
                  </div>
                </div>
                <ConfirmPayment bookingId={b.id} />
              </div>
            </div>
          ))}
          {pendingBookings.length === 0 && (
            <div className="card p-4 muted text-sm">تراکنشی در انتظار تایید نیست.</div>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-bold mb-2">پرداخت‌های پلن در انتظار تایید ({pendingSubs.length})</h2>
        <div className="space-y-3">
          {pendingSubs.map(s => (
            <div key={s.id} className="card p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-medium">
                    {s.user.phone} {s.user.name && `(${s.user.name})`}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {formatDate(s.createdAt)} — پلن {PLAN_LABELS[s.plan]} — {s.amount.toLocaleString("fa-IR")} تومان
                  </div>
                </div>
                <ConfirmSubscription subscriptionId={s.id} />
              </div>
            </div>
          ))}
          {pendingSubs.length === 0 && (
            <div className="card p-4 muted text-sm">تراکنشی در انتظار تایید نیست.</div>
          )}
        </div>
      </div>

      <div className="text-center">
        <Link href="/admin" className="text-sm text-slate-500">بازگشت</Link>
      </div>
    </div>
  );
}