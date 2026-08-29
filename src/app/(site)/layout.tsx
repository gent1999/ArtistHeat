import { GoogleAnalytics } from "@next/third-parties/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrendingBar } from "@/components/TrendingBar";
import { BackToTop } from "@/components/BackToTop";

// Public-site chrome only -- deliberately not part of the root layout so
// /admin doesn't inherit the trending bar/header/footer (or, below, GA
// tracking -- admin activity isn't public traffic).
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  // Read server-side only and passed down as a prop -- never accessed via
  // process.env in client code, so this doesn't need (and shouldn't use)
  // Next.js's NEXT_PUBLIC_ client-bundle-inlining mechanism, even though
  // the ID itself ends up visible in the rendered script tag either way.
  const gaMeasurementId = process.env.GA_MEASUREMENT_ID;

  return (
    <div className="flex min-h-full flex-col">
      <TrendingBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <BackToTop />
      {gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}
    </div>
  );
}
