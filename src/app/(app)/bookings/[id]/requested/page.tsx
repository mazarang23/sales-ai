import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BookingRequestedPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const booking = await db.booking.findUnique({
    where: { id },
    include: { consultant: { select: { displayName: true, photoUrl: true } } }
  });
  if (!booking || booking.userId !== user.id) notFound();

  return (
    <div className="container-tight py-16 max-w-lg" dir="rtl">
      <div className="card p-8 text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center text-3xl">
          ✓
        </div>
        <h1 className="h2">درخواست شما ثبت شد</h1>
        <p className="muted text-sm leading-6">
          درخواست جلسه {booking.hours} ساعته با{" "}
          <span className="font-medium text-slate-800">
            {booking.consultant.displayName}
          </span>{" "}
          ثبت شد و در انتظار تایید مشاور است.
        </p>

        <div className="rounded-xl bg-slate-50 p-4 text-sm text-right space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">تاریخ درخواست</span>
            <span>{formatDate(booking.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">مدت</span>
            <span>{booking.hours} ساعت</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">مبلغ</span>
            <span className="font-medium">
              {booking.amount.toLocaleString("fa-IR")} تومان
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">وضعیت</span>
            <span className="text-amber-700 font-medium">در انتظار تایید مشاور</span>
          </div>
        </div>

        <div className="pt-2 text-xs text-slate-500 leading-6">
          بعد از تایید مشاور، در پنل شما اعلان می‌آید و می‌توانید پرداخت را انجام دهید.
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Link href={`/bookings/${booking.id}`} className="btn-primary">
            مشاهده وضعیت درخواست
          </Link>
          <Link href="/dashboard" className="btn-ghost">
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    </div>
  );
}