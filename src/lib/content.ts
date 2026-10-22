import { db } from "@/lib/db";

const DEFAULTS: Record<string, string> = {
  "hero.title": "از فایل فروش تا یک تصمیم روشن برای رشد",
  "hero.subtitle":
    "فایل فروش‌ات را آپلود کن؛ فروش‌یار مشتریان ارزشمند، الگوهای خرید و فرصت‌های رشد را از دل داده‌ها بیرون می‌کشد و به تو می‌گوید قدم بعدی چه می‌تواند باشد.",
  "hero.cta": "تحلیل رایگان فروش من",
  "features.title": "داده را بفهم؛ بعد تصمیم بگیر",
  "features.subtitle":
    "به‌جای خیره شدن به جدول‌های فروش، الگوی مشتری، بازگشت خرید و فرصت‌های رشد را در یک داشبورد ساده ببین و در صورت نیاز از مشاور رشد کمک بگیر.",
  "pricing.title": "اول ارزش را ببین، بعد هزینه کن",
  "pricing.subtitle": "شروع تحلیل رایگان است؛ برای ظرفیت بیشتر و استفاده گسترده‌تر از AI، پلن مناسب کسب‌وکارت را انتخاب کن.",
  "footer.tagline":
    "فروش‌یار؛ تحلیل فروش، شناخت مشتری و تصمیم‌سازی برای رشد کسب‌وکارهای ایرانی."
};

export async function getContent(
  keys: string[]
): Promise<Record<string, string>> {
  try {
    const items = await db.siteContent.findMany({ where: { key: { in: keys } } });
    const map: Record<string, string> = {};
    for (const k of keys) map[k] = DEFAULTS[k] || "";
    for (const i of items) map[i.key] = i.value;
    return map;
  } catch {
    const map: Record<string, string> = {};
    for (const k of keys) map[k] = DEFAULTS[k] || "";
    return map;
  }
}
