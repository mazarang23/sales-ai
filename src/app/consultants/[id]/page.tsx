import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { BookingForm } from "@/components/site/BookingForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await db.consultant.findUnique({ where: { id } });
  return c ? { title: `${c.displayName} | مشاورین` } : { title: "مشاور" };
}

export default async function ConsultantProfile({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const c = await db.consultant.findUnique({
    where: { id },
    include: {
      _count: { select: { bookings: true } },
      bookings: {
        where: { review: { isNot: null } },
        select: { review: { select: { rating: true, comment: true } } },
        take: 20
      }
    }
  });

  if (!c || c.status !== "approved") notFound();

  const ratings = c.bookings.map(b => b.review!.rating);
  const rating = ratings.length
    ? ratings.reduce((s, r) => s + r, 0) / ratings.length
    : 0;

  let hasActiveBooking = false;
  if (user) {
    const active = await db.booking.findFirst({
      where: {
        consultantId: c.id,
        userId: user.id,
        status: { in: ["pending", "accepted"] }
      }
    });
    hasActiveBooking = !!active;
  }

  return (
    <section className="container-tight py-16 max-w-3xl" dir="rtl">
      <Link href="/consultants" className="text-sm text-brand-600">
        ← همه مشاورین
      </Link>

      <div className="mt-6 card p-8">
        <div className="flex items-start gap-5 flex-wrap">
          {c.photoUrl ? (
            <img
              src={c.photoUrl}
              alt={c.displayName}
              className="h-24 w-24 rounded-2xl object-cover border border-slate-200"
            />
          ) : (
            <div className="h-24 w-24 rounded-2xl bg-brand-50 text-brand-700 grid place-items-center text-3xl font-black">
              {c.displayName.slice(0, 1)}
            </div>
          )}
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-2xl font-bold">{c.displayName}</h1>
            <div className="mt-1 text-sm text-slate-500">
              {rating > 0 ? (
                <>⭐ {rating.toFixed(1)} از {ratings.length} نظر</>
              ) : (
                "هنوز امتیازی ثبت نشده"
              )}
              {" — "}
              {c._count.bookings} جلسه
            </div>
            <div className="mt-2 text-sm font-medium">
              تعرفه: {c.hourlyRate.toLocaleString("fa-IR")} تومان/ساعت
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              {c.linkedin && (
                <a href={c.linkedin} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
                  LinkedIn
                </a>
              )}
              {c.instagram && (
                <a href={c.instagram} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="font-bold mb-2">درباره</div>
          <p className="text-sm leading-7 whitespace-pre-wrap">{c.bio}</p>
        </div>
      </div>

      <div className="mt-6">
        {hasActiveBooking ? (
          <div className="card p-6 muted text-sm">
            شما یک درخواست فعال با این مشاور دارید. وضعیت آن را در داشبورد ببینید.
          </div>
        ) : (
          <BookingForm
            consultantId={c.id}
            hourlyRate={c.hourlyRate}
            isLoggedIn={!!user}
          />
        )}
      </div>

      {c.bookings.length > 0 && (
        <div className="mt-8 card p-6">
          <div className="font-bold mb-3">نظرات</div>
          <div className="space-y-3">
            {c.bookings.map((b, i) => (
              <div key={i} className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="text-emerald-700 font-medium">
                  ⭐ {b.review!.rating}/5
                </div>
                {b.review!.comment && (
                  <p className="mt-1 leading-6 text-slate-700">{b.review!.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}