import type { AdBanner } from '@/lib/api';

// Rendered only when the homepage has already confirmed ads are enabled and
// there's at least one active banner (see (site)/page.tsx) -- this stays a
// dumb presentational component so that decision lives in exactly one place.
// Ads only ever appear at the `xl` breakpoint and up -- below that there's
// no room to add a 220px column without squeezing the article rail or
// sidebar, so this stays `hidden` (fully removed from grid layout, not just
// visually collapsed) until xl. See (site)/page.tsx for the matching
// grid-template-columns breakpoints this depends on lining up.
export function AdColumn({ banners }: { banners: AdBanner[] }) {
  return (
    <aside className="hidden flex-col gap-4 xl:flex">
      {banners.map((ad) => (
        <a
          key={ad.id}
          href={ad.linkUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group block overflow-hidden border border-neutral-200 hover:border-red-600"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ad.imageUrl} alt={ad.title || 'Advertisement'} className="w-full object-cover" />
          {ad.title ? (
            <p className="px-2 py-1.5 text-xs text-neutral-500 group-hover:text-red-600">{ad.title}</p>
          ) : null}
        </a>
      ))}
    </aside>
  );
}
