import Link from 'next/link';

// Reflects ArtistHeat's music/fashion-first direction rather than the old
// site's flat list of every category. Legacy categories (Life, Money,
// Comedy, etc.) aren't gone -- they're just no longer in primary nav; they
// stay reachable via the footer's category list, search, and their own
// URLs. MUSIC/FASHION still point at the existing category system;
// INTERVIEWS/ARTISTS are the new editorialType-driven archive pages.
const NAV_LINKS = [
  { label: 'Music', href: '/category/music' },
  { label: 'Interviews', href: '/interviews' },
  { label: 'Artists', href: '/artists' },
  { label: 'Fashion', href: '/category/fashion' },
  { label: 'Heat Check', href: '/heat-check' },
];

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-4 py-3">
        <Link href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ArtistHeat" className="h-10 w-auto" />
        </Link>
        <nav className="hidden flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-wide md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-red-600">
              {link.label}
            </Link>
          ))}
          <Link href="/contact" className="bg-red-600 px-3 py-1.5 text-white hover:bg-red-700">
            Submit Music
          </Link>
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
