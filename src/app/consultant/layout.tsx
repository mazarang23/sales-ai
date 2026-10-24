import { AppHeader } from "@/components/layout/AppHeader";

export default function ConsultantLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader brand="moshaversho" />
      <main>{children}</main>
    </>
  );
}
