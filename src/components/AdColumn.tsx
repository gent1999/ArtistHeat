import type { AdBanner } from '@/lib/api';

// Rendered only when the caller has already confirmed ads are enabled and
// there's at least one active banner (see (site)/page.tsx and
// (site)/[slug]/page.tsx) -- this stays a dumb presentational component so
// that decision lives in exactly one place per page.
//
// `className` controls the responsive show/hide breakpoint, which differs by
// page: the homepage only has room at `xl` without squeezing the article
// rail/sidebar (default below), while the article page already reserves this
// column at `lg` regardless of what's in it, so it passes its own override.
export function AdColumn({
  banners,
  className = 'hidden flex-col gap-4 xl:flex',
}: {
  banners: AdBanner[];
  className?: string;
}) {
  return (
    <aside className={className}>
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
