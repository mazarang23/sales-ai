import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const r = await db.siteContent.deleteMany({});
  console.log(`✅ ${r.count} رکورد پاک شد`);
}

main().finally(() => db.$disconnect());