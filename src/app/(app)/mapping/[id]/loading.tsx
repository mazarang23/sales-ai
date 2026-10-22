import { ProcessingProgress } from "@/components/app/ProcessingProgress";

export default function Loading() {
  return <div className="container-tight py-10" dir="rtl"><ProcessingProgress active label="در حال آماده‌سازی صفحه مپینگ" /></div>;
}
