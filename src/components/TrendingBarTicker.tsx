import Link from 'next/link';

interface TrendingItem {
  id: number;
  slug: string;
  title: string;
}

// Base duration scales with headline count so the read speed feels roughly
// consistent regardless of how much content there is, clamped to the
// "comfortably readable" 25-40s range from the design spec.
const SECONDS_PER_ITEM = 4.5;
const MIN_DURATION_S = 25;
const MAX_DURATION_S = 40;

export function TrendingBarTicker({ items }: { items: TrendingItem[] }) {
  if (items.length === 0) return null;

  const duration = Math.min(MAX_DURATION_S, Math.max(MIN_DURATION_S, items.length * SECONDS_PER_ITEM));

  // Rendered twice back-to-back so translateX(-50%) -- exactly one copy's
  // width -- lands the track back on an identical copy of itself. That's
  // the whole seamless-loop trick: no JS, no measuring, no jump at the seam.
  const doubled = [...items, ...items];

  return (
    <div className="ticker-viewport min-w-0 flex-1">
      <div className="ticker-track flex items-center" style={{ animationDuration: `${duration}s` }}>
        {doubled.map((item, i) => {
          const isDuplicate = i >= items.length;
          return (
            <span
              key={`${isDuplicate ? 'dup' : 'orig'}-${item.id}`}
              className="flex shrink-0 items-center"
              {...(isDuplicate ? { 'aria-hidden': true, 'data-ticker-dup': '' } : {})}
            >
              <Link
                href={`/${item.slug}`}
                tabIndex={isDuplicate ? -1 : undefined}
                className="whitespace-nowrap text-[13px] font-medium text-neutral-200 transition-colors hover:text-white"
              >
                {item.title}
              </Link>
              <span className="mx-4 text-red-600" aria-hidden="true">
                {'///'}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
