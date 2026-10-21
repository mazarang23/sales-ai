import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "مشاورین" };

export default async function ConsultantsPage() {
  const approved = await db.consultant.findMany({
    where: { status: "approved" },
    include: {
      _count: { select: { bookings: true } },
      bookings: {
        where: { review: { isNot: null } },
        select: { review: { select: { rating: true } } }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const list = approved.map(c => {
    const ratings = c.bookings.map(b => b.review!.rating);
    const rating = ratings.length
      ? ratings.reduce((s, r) => s + r, 0) / ratings.length
      : 0;
    return {
      id: c.id,
      displayName: c.displayName,
      bio: c.bio,
      photoUrl: c.photoUrl,
      hourlyRate: c.hourlyRate,
      rating,
      reviewCount: ratings.length,
      bookingCount: c._count.bookings
    };
  });

  return (
    <section className="container-tight py-16" dir="rtl">
      <div className="max-w-2xl">
        <h1 className="h2">مشاورین رشد</h1>
        <p className="muted mt-3">
          از بین مشاورین تاییدشده، مناسب‌ترین را انتخاب کن و جلسه بگیر.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="card p-8 mt-8 text-center">
          <p className="muted">هنوز مشاوری تایید نشده است.</p>
          <Link href="/consultant/register" className="btn-primary mt-4 inline-flex">
            ثبت‌نام مشاور
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(c => (
            <Link
              key={c.id}
              href={`/consultants/${c.id}`}
              className="card p-5 hover:shadow-glow transition flex flex-col"
            >
              <div className="flex items-center gap-3">
                {c.photoUrl ? (
                  <img
                    src={c.photoUrl}
                    alt={c.displayName}
                    className="h-14 w-14 rounded-2xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-brand-50 text-brand-700 grid place-items-center font-black">
                    {c.displayName.slice(0, 1)}
                  </div>
                )}
                <div>
                  <div className="font-bold">{c.displayName}</div>
                  <div className="text-xs text-slate-500">
                    {c.rating > 0
                      ? `⭐ ${c.rating.toFixed(1)} (${c.reviewCount})`
                      : "جدید"}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700 line-clamp-3 flex-1">
                {c.bio}
              </p>
              <div className="mt-3 text-xs text-slate-500">
                {c.hourlyRate.toLocaleString("fa-IR")} تومان/ساعت —{" "}
                {c.bookingCount} جلسه
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}