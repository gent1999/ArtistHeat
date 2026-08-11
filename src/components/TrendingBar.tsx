import Link from 'next/link';
import { api } from '@/lib/api';
import { SOCIAL_LINKS } from '@/lib/social';
import { FacebookIcon, InstagramIcon, PinterestIcon } from './icons';

const ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  pinterest: PinterestIcon,
} as const;

// "Trending" isn't backed by real view/click tracking yet, so this uses
// the single most recent published article as an honest stand-in rather
// than fabricating a trending signal.
export async function TrendingBar() {
  const { articles } = await api.listArticles({ pageSize: 1 });
  const latest = articles[0];
  if (!latest) return null;

  return (
    <div className="flex items-center justify-between bg-neutral-950 px-4 py-2 text-white">
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 bg-red-600 px-2 py-1 text-xs font-bold uppercase tracking-wide">
          Trending
        </span>
        <Link href={`/${latest.slug}`} className="truncate text-sm font-semibold text-red-400 hover:text-red-300">
          {latest.title}
        </Link>
      </div>
      <div className="hidden shrink-0 items-center gap-3 text-white/60 sm:flex">
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
