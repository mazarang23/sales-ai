import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const db = new PrismaClient();

async function main() {
  const r = await db.user.deleteMany({ where: { password: null } });
  console.log("deleted:", r.count);
}

main().finally(() => db.$disconnect());
