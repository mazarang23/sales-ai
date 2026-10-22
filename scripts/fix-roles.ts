import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const db = new PrismaClient();

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
