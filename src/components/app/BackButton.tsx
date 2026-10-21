"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function BackButton({
  href,
  label = "بازگشت"
}: {
  href?: string;
  label?: string;
}) {
  const router = useRouter();

  if (href) {
    return (
      <Link href={href} className="btn-ghost text-sm">
        ← {label}
      </Link>
    );
  }

  return (
    <button onClick={() => router.back()} className="btn-ghost text-sm">
      ← {label}
    </button>
  );
}