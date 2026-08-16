import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrendingBar } from "@/components/TrendingBar";
import { BackToTop } from "@/components/BackToTop";

// Public-site chrome only -- deliberately not part of the root layout so
// /admin doesn't inherit the trending bar/header/footer.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <TrendingBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <BackToTop />
    </div>
  );
}
