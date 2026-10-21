import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

const CONTENTS = [
  { key: "hero.title", type: "text", value: "فروشگاهت رشد نمی‌کند یا فقط نمی‌دانی چرا؟" },
  { key: "hero.subtitle", type: "text", value: "فایل اکسل فروش را آپلود کن و در چند دقیقه تحلیل مشتریان، محصولات، فروش و برنامه رشد هوشمند دریافت کن." },
  { key: "hero.cta", type: "text", value: "شروع تحلیل رایگان" },
  { key: "features.title", type: "text", value: "همه‌چیز برای رشد، در یک داشبورد" },
  { key: "features.subtitle", type: "text", value: "از داده‌های خام اکسل تا بینش قابل اجرا. بدون فرمول، بدون پیچیدگی." },
  { key: "pricing.title", type: "text", value: "تعرفه شفاف" },
  { key: "pricing.subtitle", type: "text", value: "تحلیل اولیه رایگان. برنامه رشد، وقتی ارزشش را دیدی." },
  { key: "footer.tagline", type: "text", value: "تحلیل هوشمند فروش فروشگاه‌های ایرانی. اکسل بده، رشد بگیر." }
];

async function main() {
  for (const c of CONTENTS) {
    await db.siteContent.upsert({
      where: { key: c.key },
      update: { value: c.value, type: c.type },
      create: c
    });
  }
  console.log(`✅ ${CONTENTS.length} محتوا ذخیره شد`);
}

main().finally(() => db.$disconnect());