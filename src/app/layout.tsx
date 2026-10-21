import type { Metadata } from "next";
import "./globals.css";
import { vazirmatnVariable } from "next-persian-fonts/vazirmatn-variable";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "فروشیار AI — تحلیل هوشمند فروش و مشاوره رشد",
    template: "%s | فروشیار AI"
  },
  description:
    "فایل اکسل فروش را آپلود کن، تحلیل هوشمند بگیر، و با مشاورین خبره رشد فروشگاهت را بزرگ کن.",
  openGraph: { type: "website", locale: "fa_IR", siteName: "فروشیار AI" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatnVariable.variable}>
      <body className="min-h-screen bg-slate-50 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}