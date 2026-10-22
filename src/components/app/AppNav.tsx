import Link from "next/link";

// The global AppHeader already contains the main navigation links.
// Keep this contextual bar only for the upload entry to avoid duplicate tabs.
export function AppNav() {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="container-tight flex gap-1 py-2 text-sm">
        <Link href="/upload" className="rounded-lg px-3 py-1.5 whitespace-nowrap text-slate-600 hover:bg-slate-100">
          آپلود جدید
        </Link>
      </div>
    </div>
  );
}
