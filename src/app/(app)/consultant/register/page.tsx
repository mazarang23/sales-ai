import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ConsultantRegisterForm } from "@/components/app/ConsultantRegisterForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ConsultantRegisterPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const existing = await db.consultant.findUnique({ where: { userId: user.id } });
  ...
}