import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function AppNav({ current }: { current?: string }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const consultant = await db.consultant.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true }
  });

  const items: { href: string; label: string; key: string }[] = [
    { href: "/dashboard", label: "Ø¯Ø§Ø´Ø¨ÙˆØ±Ø¯", key: "dashboard" },
    { href: "/bookings", label: "Ø¬Ù„Ø³Ø§Øª", key: "bookings" },
    { href: "/account", label: "Ø­Ø³Ø§Ø¨ Ù…Ù†", key: "account" },
    { href: "/upload", label: "Ø¢Ù¾Ù„ÙˆØ¯ Ø¬Ø¯ÛŒØ¯", key: "upload" }
  ];

  return (
    <div className="border-b border-slate-200 bg-white sticky top-14 z-30">
      <div className="container-tight flex gap-1 overflow-x-auto py-2 text-sm">
        {items.map(it => (
          <Link
            key={it.key}
            href={it.href}
            className={`rounded-lg px-3 py-1.5 whitespace-nowrap transition ${
              current === it.key
                ? "bg-brand-50 text-brand-700 font-medium"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {it.label}
          </Link>
        ))}
        {consultant && (
          <Link
            href="/consultant/dashboard"
            className="rounded-lg px-3 py-1.5 whitespace-nowrap text-emerald-700 hover:bg-emerald-50"
          >
            Ù¾Ù†Ù„ Ù…Ø´Ø§ÙˆØ±
          </Link>
        )}
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="rounded-lg px-3 py-1.5 whitespace-nowrap text-brand-700 hover:bg-brand-50"
          >
            Ù¾Ù†Ù„ Ø§Ø¯Ù…ÛŒÙ†
          </Link>
        )}
      </div>
    </div>
  );
}