import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });
async function main() {
  const r = await db.user.deleteMany({ where: { password: null } });
  console.log("deleted:", r.count);
}
main().finally(() => db.$disconnect());
