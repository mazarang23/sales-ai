import { db } from "@/lib/db";
import { ContentEditor } from "@/components/admin/ContentEditor";

export const dynamic = "force-dynamic";

const KEYS = [
  "hero.title",
  "hero.subtitle",
  "hero.cta",
  "features.title",
  "features.subtitle",
  "pricing.title",
  "pricing.subtitle",
  "footer.tagline"
];

export default async function AdminContentPage() {
  const existing = await db.siteContent.findMany({ orderBy: { key: "asc" } });
  const existingKeys = new Set(existing.map(e => e.key));

  // اطمینان از وجود کلیدهای پیش‌فرض
  for (const k of KEYS) {
    if (!existingKeys.has(k)) {
      await db.siteContent.create({
        data: { key: k, type: "text", value: "" }
      });
    }
  }

  const items = await db.siteContent.findMany({ orderBy: { key: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h2">مدیریت محتوای سایت</h1>
        <p className="muted mt-2 text-sm">
          متن‌های Hero، Features، Pricing و Footer را از اینجا به‌روز کن.
          تغییرات فوراً در سایت اعمال می‌شود.
        </p>
      </div>
      <ContentEditor
        initial={items.map(i => ({ id: i.id, key: i.key, type: i.type, value: i.value }))}
      />
    </div>
  );
}