import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const db = new PrismaClient();

async function main() {
  const r = await db.siteContent.deleteMany({});
  console.log(`✅ ${r.count} رکورد پاک شد`);
}

main().finally(() => db.$disconnect());
