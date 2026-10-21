import Link from "next/link";
import { PLANS } from "@/lib/plans";

export function PricingCards({
  title,
  subtitle
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section id="pricing" className="py-20 bg-white border-y border-slate-200">
      <div className="container-tight">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="h2">{title || "تعرفه شفاف"}</h2>
          <p className="muted mt-3">
            {subtitle || "تحلیل اولیه رایگان. برنامه رشد، وقتی ارزشش را دیدی."}
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {(["free", "pro", "business"] as const).map(planKey => {
            const p = PLANS[planKey];
            const highlight = planKey === "pro";
            return (
              <div
                key={planKey}
                className={`card p-7 flex flex-col ${highlight ? "ring-2 ring-brand-500 shadow-glow" : ""}`}
              >
                {highlight && (
                  <div className="mb-3 inline-block rounded-full bg-brand-600 px-3 py-1 text-xs text-white w-fit">
                    پیشنهاد ما
                  </div>
                )}
                <div className="font-bold text-lg">{p.label}</div>
                <div className="mt-3">
                  <span className="text-3xl font-black">
                    {p.price === 0 ? "۰" : p.price.toLocaleString("fa-IR")}
                  </span>
                  <span className="muted mr-1 text-sm">
                    {" "}تومان / {p.price === 0 ? "همیشه" : "ماهانه"}
                  </span>
                </div>
                {p.tagline && (
                  <p className="muted text-sm mt-2">{p.tagline}</p>
                )}
                <ul className="mt-6 space-y-2 text-sm flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-emerald-600 shrink-0">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={planKey === "free" ? "/register" : "/account/upgrade"}
                  className={`mt-6 w-full text-center ${highlight ? "btn-primary" : "btn-ghost"}`}
                >
                  {planKey === "free" ? "شروع رایگان" : `خرید پلن ${p.label}`}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}