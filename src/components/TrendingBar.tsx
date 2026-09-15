import { api } from '@/lib/api';
import { SOCIAL_LINKS } from '@/lib/social';
import { FacebookIcon, FlameIcon, InstagramIcon, PinterestIcon } from './icons';
import { TrendingBarTicker } from './TrendingBarTicker';

const ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  pinterest: PinterestIcon,
} as const;

const TICKER_TARGET_COUNT = 8;
const TICKER_MIN_COUNT = 5;

export async function TrendingBar() {
  // isTrending is a real editorial flag (set from the article admin form),
  // not view/click analytics -- but it's the actual "trending" signal this
  // app has, so it's the right source rather than just "recent articles."
  const { articles: trending } = await api.listArticles({ isTrending: true, pageSize: TICKER_TARGET_COUNT });

  const items = [...trending];
  if (items.length < TICKER_MIN_COUNT) {
    // Not enough articles are flagged trending yet to fill the ticker --
    // backfill with recent articles so it's not a sparse, awkward loop.
    const { articles: recent } = await api.listArticles({ pageSize: TICKER_TARGET_COUNT });
    const seenIds = new Set(items.map((article) => article.id));
    for (const article of recent) {
      if (items.length >= TICKER_TARGET_COUNT) break;
      if (!seenIds.has(article.id)) {
        items.push(article);
        seenIds.add(article.id);
      }
    }
  }

  if (items.length === 0) return null;

  const tickerItems = items.map((article) => ({ id: article.id, slug: article.slug, title: article.title }));

  return (
    <div className="flex h-10 items-stretch bg-black text-white">
      <div
        className="flex shrink-0 items-center gap-1.5 bg-red-600 pl-4 pr-7 text-xs font-extrabold uppercase tracking-wide"
        style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 16px) 100%, 0 100%)' }}
      >
        <FlameIcon className="h-3.5 w-3.5 shrink-0" />
        Trending
      </div>
      <TrendingBarTicker items={tickerItems} />
      <div className="hidden shrink-0 items-center gap-3 pl-4 pr-4 text-white/60 sm:flex">
        {SOCIAL_LINKS.map((link) => {
          const Icon = ICONS[link.platform];
          return (
            <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="hover:text-red-400">
              <Icon />
            </a>
          );
        })}
      </div>
    </div>
  );
}
