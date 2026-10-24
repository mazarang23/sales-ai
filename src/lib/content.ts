import { db } from "@/lib/db";

const DEFAULTS: Record<string, string> = {
  "hero.title": "با چند کلیک بفهم کدام مشتری‌ها و محصولات به رشد فروش کمک می‌کنند",
  "hero.subtitle":
    "فایل اکسل یا CSV فروش را وارد کن؛ فروش‌یار روند فروش، مشتریان ارزشمند و نشانه‌های ریزش را به داشبوردی قابل فهم تبدیل می‌کند و برای قدم بعدی پیشنهاد می‌دهد. شروع رایگان است و به کارت بانکی نیاز نداری.",
  "hero.cta": "تحلیل رایگان فایل فروش",
  "features.title": "از داده خام تا اقدام قابل اجرا",
  "features.subtitle":
    "شاخص‌های فروش، مشتریان وفادار و در معرض ریزش، محصولات برتر و بازگشت مشتری را کنار هم ببین؛ سپس پیشنهادها را با شناخت واقعی کسب‌وکارت اولویت‌بندی کن.",
  "pricing.title": "با پلن رایگان شروع کن؛ وقتی به ظرفیت بیشتری نیاز داشتی ارتقا بده",
  "pricing.subtitle": "محدودیت هر پلن شفاف است: تعداد فایل، حجم داده و سهمیه ماهانه قابلیت‌های هوشمند. فقط وقتی نیازت بیشتر شد، پلن بالاتر را انتخاب کن.",
  "footer.tagline":
    "فروش‌یار؛ تحلیل فروش، شناخت مشتری و تصمیم‌سازی برای رشد کسب‌وکارهای ایرانی."
};

const LEGACY_DEFAULTS: Record<string, string> = {
  "hero.title": "از فایل فروش تا یک تصمیم روشن برای رشد",
  "hero.subtitle": "فایل فروش‌ات را آپلود کن؛ فروش‌یار مشتریان ارزشمند، الگوهای خرید و فرصت‌های رشد را از دل داده‌ها بیرون می‌کشد و به تو می‌گوید قدم بعدی چه می‌تواند باشد.",
  "hero.cta": "تحلیل رایگان فروش من",
  "features.title": "داده را بفهم؛ بعد تصمیم بگیر",
  "features.subtitle": "به‌جای خیره شدن به جدول‌های فروش، الگوی مشتری، بازگشت خرید و فرصت‌های رشد را در یک داشبورد ساده ببین و در صورت نیاز از مشاور رشد کمک بگیر.",
  "pricing.title": "اول ارزش را ببین، بعد هزینه کن",
  "pricing.subtitle": "شروع تحلیل رایگان است؛ برای ظرفیت بیشتر و استفاده گسترده‌تر از AI، پلن مناسب کسب‌وکارت را انتخاب کن."
};

export async function getContent(
  keys: string[]
): Promise<Record<string, string>> {
  try {
    const items = await db.siteContent.findMany({ where: { key: { in: keys } } });
    const map: Record<string, string> = {};
    for (const k of keys) map[k] = DEFAULTS[k] || "";
    for (const i of items) map[i.key] = LEGACY_DEFAULTS[i.key] === i.value ? (DEFAULTS[i.key] || "") : i.value;
    return map;
  } catch {
    const map: Record<string, string> = {};
    for (const k of keys) map[k] = DEFAULTS[k] || "";
    return map;
  }
}
