import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const adminPhone = process.env.ADMIN_PHONE;
  if (!adminPhone) {
    console.error("ADMIN_PHONE در .env تنظیم نشده");
    process.exit(1);
  }
  const r = await db.user.updateMany({
    where: { NOT: { phone: adminPhone } },
    data: { role: "USER" }
  });
  console.log(`✅ ${r.count} کاربر به USER تغییر کرد`);
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    select: { phone: true }
  });
  console.log("ادمین‌های فعلی:", admins);
}

main().finally(() => db.$disconnect());