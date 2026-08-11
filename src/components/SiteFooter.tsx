import Link from 'next/link';
import { api } from '@/lib/api';
import { SOCIAL_LINKS } from '@/lib/social';
import { FacebookIcon, InstagramIcon, PinterestIcon } from './icons';

const SOCIAL_ICONS = { facebook: FacebookIcon, instagram: InstagramIcon, pinterest: PinterestIcon } as const;

// These point at pages the site doesn't have yet (About/Contact/Disclaimer
// are content, not something to fabricate) -- they're here because the
// reference design has them, but they'll 404 until those pages exist.
const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Collab & Advertising', href: '/collab-advertising' },
  { label: 'Contact', href: '/contact' },
  { label: 'Disclaimer', href: '/disclaimer' },
];

export async function SiteFooter() {
  const [{ articles: latestPosts }, { categories }] = await Promise.all([
    api.listArticles({ pageSize: 5 }),
    api.listCategories(),
  ]);
  const topCategories = [...categories].sort((a, b) => (b.articleCount ?? 0) - (a.articleCount ?? 0)).slice(0, 8);

  return (
    <footer className="bg-red-600 text-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-4 pt-10 pb-16 sm:grid-cols-2 md:grid-cols-4">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ArtistHeat" className="h-16 w-auto" />
        </div>

        <div>
          <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wide">Quick Links</h2>
          <ul className="flex flex-col gap-2 text-sm font-semibold">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wide">Latest Posts</h2>
          <ul className="flex flex-col gap-3 text-sm font-semibold leading-snug">
            {latestPosts.map((article) => (
              <li key={article.id}>
                <Link href={`/${article.slug}`} className="hover:underline">
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wide">Categories</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-semibold">
            {topCategories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} className="hover:underline">
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 px-4 py-6 text-center text-sm">
        <p>
          &copy; Est 2023 ArtistHeat. Owned and run by{' '}
          <a href="https://cry808.com" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
            cry808.com
          </a>
          .
        </p>
        <div className="mt-4 flex justify-center gap-3">
          {SOCIAL_LINKS.map((link) => {
            const Icon = SOCIAL_ICONS[link.platform];
            return (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="text-white/90 hover:text-white"
              >
                <Icon />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
