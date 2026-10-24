import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getEffectivePlan } from "@/lib/plans";
import { computeKpis, topBy } from "@/lib/analytics/kpi";
import { computeRfm } from "@/lib/analytics/rfm";
import { computeCohort } from "@/lib/analytics/cohort";
import { formatDate, formatNum, formatMoney } from "@/lib/utils";
import { currencyLabel, Currency } from "@/lib/excel/currency";
import { PrintReportButton } from "@/components/app/PrintReportButton";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "گزارش PDF تحلیل فروش" };

const SEGMENTS: Record<string, string> = {
  Champions: "قهرمانان",
  Loyal: "وفادار",
  Potential: "مستعد رشد",
  AtRisk: "در معرض ریزش",
  Lost: "از دست‌رفته"
};

export default async function SalesReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/reports/${id}`);
  if (getEffectivePlan(user) === "free") redirect("/account/upgrade");

  const upload = await db.upload.findFirst({ where: { id, userId: user.id }, include: { mappings: true } });
  if (!upload) notFound();

  const rows = await db.dataRow.findMany({ where: { uploadId: upload.id }, orderBy: { date: "asc" }, take: 500000 });
  const currency = (((upload.mappings?.fieldMap as any)?._currency || "rial") as Currency);
  const money = (value: number | null | undefined) => formatMoney(value, currency);
  const kpis = computeKpis(rows as any);
  const products = topBy(rows as any, "product", 10);
  const rfm = computeRfm(rows as any);
  const segments = rfm.reduce((acc, customer) => { acc[customer.segment] = (acc[customer.segment] || 0) + 1; return acc; }, {} as Record<string, number>);
  const cohorts = computeCohort(rows as any, "month").slice(-8);

  return <main className="report-shell" dir="rtl">
    <style>{`
      @page { size: A4; margin: 14mm; }
      @media print {
        body { background: white !important; }
        .no-print { display: none !important; }
        .report-shell { max-width: none !important; padding: 0 !important; }
        .report-section, .report-kpi { break-inside: avoid; box-shadow: none !important; }
        a { color: inherit !important; text-decoration: none !important; }
      }
    `}</style>
    <div className="report-actions no-print">
      <Link href={`/dashboard/${upload.id}`} className="btn-ghost">بازگشت به داشبورد</Link>
      <PrintReportButton />
    </div>
    <header className="report-cover">
      <div className="report-brand-mark">ف</div>
      <div>
        <div className="report-brand">فروشیار <span>AI</span></div>
        <div className="report-kicker">گزارش هوشمند تحلیل فروش</div>
      </div>
      <div className="report-cover-meta">
        <div>تاریخ تهیه گزارش</div>
        <strong>{new Date().toLocaleDateString("fa-IR")}</strong>
      </div>
      <h1>گزارش عملکرد فروش</h1>
      <p>{upload.fileName}</p>
      <div className="report-cover-line" />
      <div className="report-cover-summary">{formatNum(upload.rowCount)} ردیف داده · {formatDate(upload.createdAt)} · واحد مبالغ: {currencyLabel(currency)}</div>
    </header>

    <section className="report-section">
      <div className="report-section-heading"><span>۰۱</span><div><h2>خلاصه مدیریتی</h2><p>نمای کلی عملکرد بر اساس داده‌های فایل انتخاب‌شده</p></div></div>
      <div className="report-kpi-grid">
        <Kpi label="فروش کل" value={money(kpis.total)} />
        <Kpi label="تعداد سفارش" value={formatNum(kpis.orders)} />
        <Kpi label="مشتریان یکتا" value={formatNum(kpis.customers)} />
        <Kpi label="میانگین سبد خرید" value={money(kpis.aov)} />
      </div>
      <p className="report-note">این شاخص‌ها از داده‌های واردشده محاسبه شده‌اند. نتیجه به کامل بودن ستون‌های فروش، مشتری، تاریخ و سفارش در فایل اصلی وابسته است.</p>
    </section>

    <section className="report-section">
      <div className="report-section-heading"><span>۰۲</span><div><h2>محصولات برتر</h2><p>رتبه‌بندی بر اساس مجموع مبلغ ثبت‌شده</p></div></div>
      {products.length ? <table className="report-table"><thead><tr><th>رتبه</th><th>محصول</th><th>تعداد ردیف</th><th>مجموع فروش</th></tr></thead><tbody>{products.map((p, i) => <tr key={p.name}><td>{formatNum(i + 1)}</td><td>{p.name}</td><td>{formatNum(p.count)}</td><td>{money(p.amount)}</td></tr>)}</tbody></table> : <p className="report-note">نام محصول در فایل شناسایی نشده یا داده کافی وجود ندارد.</p>}
    </section>

    <section className="report-section">
      <div className="report-section-heading"><span>۰۳</span><div><h2>بخش‌بندی مشتریان (RFM)</h2><p>ترکیب تازگی خرید، تکرار خرید و ارزش پولی</p></div></div>
      <div className="report-segment-grid">{Object.entries(SEGMENTS).map(([key, label]) => <div className="report-segment" key={key}><span>{label}</span><strong>{formatNum(segments[key] || 0)}</strong><small>مشتری</small></div>)}</div>
      <p className="report-note">RFM ابزار اولویت‌بندی مشتریان است؛ بخش‌بندی، تضمین رفتار آینده نیست و باید در کنار شناخت کسب‌وکار تفسیر شود.</p>
    </section>

    <section className="report-section">
      <div className="report-section-heading"><span>۰۴</span><div><h2>بازگشت مشتریان (Cohort)</h2><p>تعداد مشتریان فعال در دوره‌های پس از اولین خرید</p></div></div>
      {cohorts.length ? <div className="overflow-x-auto"><table className="report-table"><thead><tr><th>دوره اولین خرید</th><th>اندازه گروه</th><th>دوره صفر</th><th>دوره ۱</th><th>دوره ۲</th><th>دوره ۳</th></tr></thead><tbody>{cohorts.map(c => <tr key={c.cohortKey}><td>{c.cohortLabel}</td><td>{formatNum(c.size)}</td>{[0,1,2,3].map(i => <td key={i}>{c.periods[i] ? `${formatNum(c.periods[i].retained)} (${Math.round(c.periods[i].retained / Math.max(1, c.size) * 100)}٪)` : "—"}</td>)}</tr>)}</tbody></table></div> : <p className="report-note">برای تحلیل کوهورت، وجود نام مشتری و تاریخ معتبر خرید ضروری است.</p>}
    </section>

    <footer className="report-footer">
      <div className="report-brand">فروشیار <span>AI</span></div>
      <p>تحلیل داده برای تصمیم‌های بهتر؛ نه جایگزین قضاوت مدیریتی.</p>
      <small>گزارش تولیدشده از داده‌های حساب شما · {new Date().toLocaleDateString("fa-IR")}</small>
    </footer>

    <style>{`
      .report-shell { max-width: 980px; margin: 0 auto; padding: 28px 24px 48px; color: #172033; background: #fff; font-family: inherit; }
      .report-actions { display:flex; justify-content:space-between; gap:12px; margin-bottom:20px; }
      .report-cover { position:relative; overflow:hidden; border-radius:24px; padding:34px; color:#fff; background:linear-gradient(130deg,#101b35 0%,#243b72 60%,#245f78 100%); }
      .report-brand { font-weight:900; font-size:22px; letter-spacing:-.5px; }
      .report-brand span { color:#55d6c2; font-size:.75em; }
      .report-brand-mark { float:right; display:grid; place-items:center; width:44px; height:44px; margin-left:12px; border-radius:14px; background:#55d6c2; color:#102039; font-size:25px; font-weight:900; }
      .report-kicker { margin-top:5px; color:#c8d5ed; font-size:12px; }
      .report-cover-meta { position:absolute; top:34px; left:34px; text-align:left; color:#c8d5ed; font-size:11px; }
      .report-cover-meta strong { display:block; margin-top:6px; color:white; font-size:14px; }
      .report-cover h1 { clear:both; padding-top:42px; font-size:32px; font-weight:900; line-height:1.3; }
      .report-cover p { margin-top:10px; color:#d6e0f1; font-size:15px; overflow-wrap:anywhere; }
      .report-cover-line { width:70px; height:4px; margin-top:24px; border-radius:10px; background:#55d6c2; }
      .report-cover-summary { margin-top:14px; color:#d6e0f1; font-size:12px; }
      .report-section { margin-top:26px; padding:24px; border:1px solid #e2e8f0; border-radius:20px; background:#fff; box-shadow:0 8px 28px rgba(20,40,80,.05); }
      .report-section-heading { display:flex; align-items:flex-start; gap:12px; margin-bottom:20px; }
      .report-section-heading > span { display:grid; place-items:center; min-width:36px; height:36px; border-radius:12px; color:#087e78; background:#e3faf5; font-size:12px; font-weight:900; }
      .report-section-heading h2 { font-size:18px; font-weight:900; }
      .report-section-heading p { margin-top:5px; color:#64748b; font-size:12px; }
      .report-kpi-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; }
      .report-kpi { padding:16px; border-radius:15px; background:#f6f8fc; border:1px solid #edf1f7; }
      .report-kpi span { display:block; color:#64748b; font-size:11px; }
      .report-kpi strong { display:block; margin-top:9px; font-size:18px; font-weight:900; overflow-wrap:anywhere; }
      .report-table { width:100%; border-collapse:collapse; font-size:12px; }
      .report-table th { padding:11px 10px; color:#475569; background:#f1f5f9; text-align:right; font-weight:800; }
      .report-table td { padding:11px 10px; border-bottom:1px solid #e8edf4; text-align:right; }
      .report-table tr:nth-child(even) td { background:#fbfcfe; }
      .report-segment-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:8px; }
      .report-segment { display:flex; flex-direction:column; gap:7px; padding:14px; border:1px solid #e2e8f0; border-radius:14px; background:#fbfcfe; }
      .report-segment span { color:#64748b; font-size:11px; }
      .report-segment strong { font-size:23px; font-weight:900; color:#17365d; }
      .report-segment small { color:#94a3b8; font-size:10px; }
      .report-note { margin-top:14px; padding:12px 14px; border-right:3px solid #55d6c2; border-radius:8px; color:#64748b; background:#f7fafc; font-size:11px; line-height:1.9; }
      .report-footer { margin-top:28px; padding:20px 4px; border-top:1px solid #e2e8f0; }
      .report-footer p { margin-top:6px; color:#64748b; font-size:12px; }
      .report-footer small { display:block; margin-top:10px; color:#94a3b8; font-size:10px; }
      @media (max-width:700px) { .report-kpi-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .report-segment-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .report-cover { padding:24px; } .report-cover-meta { top:24px; left:24px; } .report-cover h1 { font-size:26px; } }
      @media print { .report-section { padding:14px; margin-top:14px; } .report-cover { padding:26px; } .report-kpi strong { font-size:15px; } .report-table { font-size:10px; } }
    `}</style>
  </main>;
}

function Kpi({ label, value }: { label: string; value: string }) {
  return <div className="report-kpi"><span>{label}</span><strong>{value}</strong></div>;
}
