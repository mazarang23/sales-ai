import { db } from "@/lib/db";
import { ContentEditor } from "@/components/admin/ContentEditor";

export const dynamic = "force-dynamic";

const DEFAULT_KEYS = [
  "hero.title",
  "hero.subtitle",
  "hero.cta",
  "features.title",
  "features.subtitle",
  "pricing.title",
  "pricing.subtitle",
  "footer.tagline",
  "payment.cardNumber",
  "payment.shaba",
  "payment.holderName",
  "payment.bankName"
];

const DEFAULT_VALUES: Record<string, string> = {
  "payment.cardNumber": "6219-8619-1234-5678",
  "payment.shaba": "IR00-0000-0000-0000-0000-0000-00",
  "payment.holderName": "فروشیار",
  "payment.bankName": "بانک سامان"
};

export default async function AdminContentPage() {
  const existing = await db.siteContent.findMany({ orderBy: { key: "asc" } });
  const existingKeys = new Set(existing.map(e => e.key));

  // اطمینان از وجود کلیدهای پیش‌فرض
  for (const k of DEFAULT_KEYS) {
    if (!existingKeys.has(k)) {
      await db.siteContent.create({
        data: {
          key: k,
          type: "text",
          value: DEFAULT_VALUES[k] || ""
        }
      });
    }
  }

  const items = await db.siteContent.findMany({ orderBy: { key: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h2">مدیریت محتوای سایت</h1>
        <p className="muted mt-2 text-sm">
          متن‌های Hero، Features، Pricing، Footer و اطلاعات پرداخت را از اینجا به‌روز کن.
          تغییرات فوراً در سایت اعمال می‌شود.
        </p>
      </div>
      <ContentEditor
        initial={items.map(i => ({
          id: i.id,
          key: i.key,
          type: i.type,
          value: i.value
        }))}
      />
    </div>
  );
}