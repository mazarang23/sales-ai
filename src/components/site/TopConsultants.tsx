"use client";
import { useState } from "react";
import Link from "next/link";

export type TopConsultant = {
  id: string;
  displayName: string;
  bio: string;
  photoUrl: string | null;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  bookingCount: number;
};

export function TopConsultants({ consultants }: { consultants: TopConsultant[] }) {
  const [index, setIndex] = useState(0);
  if (consultants.length === 0) {
    return (
      <section className="py-20">
        <div className="container-tight text-center">
          <h2 className="h2">مشاورین برتر</h2>
          <p className="muted mt-3">
            هنوز مشاوری ثبت‌نام نکرده. اولین مشاور باش!
          </p>
          <Link href="/consultant/register" className="btn-primary mt-6 inline-flex">
            ثبت‌نام مشاور
          </Link>
        </div>
      </section>
    );
  }

  const c = consultants[index];
  const prev = () => setIndex(i => (i - 1 + consultants.length) % consultants.length);
  const next = () => setIndex(i => (i + 1) % consultants.length);

  return (
    <section className="py-20 bg-white border-y border-slate-200" id="consultants">
      <div className="container-tight">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="h2">مشاورین برتر</h2>
          <p className="muted mt-3">
            با مشاورین خبره گفتگو کن و فروشگاهت را به سطح بالاتری ببر.
          </p>
        </div>

        <div className="mt-10 max-w-2xl mx-auto">
          <div className="card p-8">
            <div className="flex items-start gap-5">
              <div className="shrink-0">
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
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg">{c.displayName}</div>
                  <div className="text-sm">
                    {c.rating > 0 ? (
                      <span className="text-emerald-700 font-medium">
                        ⭐ {c.rating.toFixed(1)} ({c.reviewCount})
                      </span>
                    ) : (
                      <span className="text-slate-400">جدید</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {c.bookingCount} جلسه برگزار شده — تعرفه:{" "}
                  {c.hourlyRate.toLocaleString("fa-IR")} تومان/ساعت
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700 line-clamp-4">
                  {c.bio}
                </p>
                <Link
                  href={`/consultants/${c.id}`}
                  className="btn-primary mt-4 inline-flex text-sm"
                >
                  مشاهده پروفایل و رزرو
                </Link>
              </div>
            </div>
          </div>

          {consultants.length > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <button onClick={prev} className="btn-ghost text-sm">قبلی</button>
              <div className="text-xs text-slate-500">
                {index + 1} از {consultants.length}
              </div>
              <button onClick={next} className="btn-ghost text-sm">بعدی</button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/consultant/register" className="text-sm text-brand-600 font-medium">
            مشاور هستی؟ ثبت‌نام کن ←
          </Link>
        </div>
      </div>
    </section>
  );
}