import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://artistheat.com"),
  title: {
    default: "ArtistHeat",
    template: "%s | ArtistHeat",
  },
  description: "Music, art, and culture.",
  // Site-wide fallback share image (link unfurls on X, Discord, etc.) for
  // every page that doesn't set its own -- articles override this with
  // their featured image when they have one (see [slug]/page.tsx).
  openGraph: {
    siteName: "ArtistHeat",
    type: "website",
    images: [{ url: "/artistheat_banner.png", width: 1916, height: 821 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/artistheat_banner.png"],
  },
  // Only emitted once a real code exists -- if artistheat.com is already
  // verified via DNS TXT record in Search Console, this isn't needed at
  // all; leave the env var unset in that case.
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
