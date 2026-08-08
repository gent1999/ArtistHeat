import Link from 'next/link';
import { api } from '@/lib/api';

// Mirrors the old site's curated header menu order (a hand-picked subset
// of categories, not "all of them" -- e.g. Uncategorized never appeared
// in nav). Falls back gracefully if a slug doesn't exist in this dataset.
const NAV_ORDER = [
  'art-and-design',
  'creators-and-influencers',
  'writing-blogging',
  'music',
  'life',
  'fashion',
  'beauty',
  'acting',
  'comedy',
  'money',
];

export async function SiteHeader() {
  const { categories } = await api.listCategories();
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const navCategories = NAV_ORDER.map((slug) => bySlug.get(slug)).filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
        <Link href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ArtistHeat" className="h-10 w-auto" />
        </Link>
        <nav className="hidden flex-wrap gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-wide md:flex">
          {navCategories.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="hover:text-red-600">
              {c.name}
            </Link>
          ))}
        </nav>
        <SearchIcon />
      </div>
    </header>
  );
}

function SearchIcon() {
  // Visual parity with the reference design; search isn't wired up yet.
  return (
    <span className="shrink-0 text-neutral-700" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    </span>
  );
}
