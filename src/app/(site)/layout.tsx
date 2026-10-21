import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlobalHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}