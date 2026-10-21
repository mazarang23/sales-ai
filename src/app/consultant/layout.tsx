import { AppHeader } from "@/components/layout/AppHeader";

export default function ConsultantLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main>{children}</main>
    </>
  );
}