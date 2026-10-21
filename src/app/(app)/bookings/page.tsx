import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { AppNav } from "@/components/app/AppNav";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MyBookings() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const bookings = await db.booking.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      consultant: { select: { displayName: true, photoUrl: true } },
      review: true
    }
  });

  const statusMap: Record<string, string> = {
    pending: "در انتظار تایید",
    accepted: "تایید شده",
    rejected: "رد شده",
    completed: "تکمیل شده"
  };

  return (
    <>
      <AppNav current="bookings" />
      <div className="container-tight py-10 space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <h1 className="h2">جلسات من</h1>
          <Link href="/consultants" className="btn-primary text-sm">رزرو جدید</Link>
        </div>

        {bookings.length === 0 ? (
          <div className="card p-8 text-center muted">
            هنوز جلسه‌ای رزرو نکردی.
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className="card p-4 flex items-center justify-between hover:shadow-glow transition"
              >
                <div className="flex items-center gap-3">
                  {b.consultant.photoUrl ? (
                    <img
                      src={b.consultant.photoUrl}
                      alt={b.consultant.displayName}
                      className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-700 grid place-items-center font-black">
                      {b.consultant.displayName.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{b.consultant.displayName}</div>
                    <div className="text-xs text-slate-500">
                      {formatDate(b.createdAt)} — {b.amount.toLocaleString("fa-IR")} تومان
                    </div>
                  </div>
                </div>
                <div className="text-xs">
                  <span className={`rounded px-2 py-0.5 ${
                    b.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                    b.status === "rejected" ? "bg-red-50 text-red-700" :
                    b.status === "accepted" ? "bg-blue-50 text-blue-700" :
                    "bg-amber-50 text-amber-700"
                  }`}>
                    {statusMap[b.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}