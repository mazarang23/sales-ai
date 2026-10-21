import { db } from "@/lib/db";

const DEFAULTS: Record<string, string> = {
  "hero.title": "داده‌ات را تحلیل کن، با مشاور رشد ببر جلو",
  "hero.subtitle":
    "فایل اکسل فروش را آپلود کن، تحلیل هوشمند بگیر، و اگر خواستی با مشاورین خبره‌ی رشد، قدم‌به‌قدم فروشگاهت را بزرگ کن.",
  "hero.cta": "شروع تحلیل رایگان",
  "features.title": "تحلیل + مشاوره، در یک پلتفرم",
  "features.subtitle":
    "از داده‌ی خام اکسل تا اقدام عملی، بدون فرمول و بدون پیچیدگی.",
  "pricing.title": "تعرفه شفاف",
  "pricing.subtitle": "تحلیل اولیه رایگان. مشاوره و برنامه رشد، وقتی ارزشش را دیدی.",
  "footer.tagline":
    "تحلیل هوشمند فروش + مشاوره تخصصی، برای فروشگاه‌های ایرانی."
};

export async function getContent(
  keys: string[]
): Promise<Record<string, string>> {
  try {
    const items = await db.siteContent.findMany({
      where: { key: { in: keys } }
    });
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