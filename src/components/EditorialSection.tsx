import Link from 'next/link';
import type { ArticleSummary } from '@/lib/api';
import { ArticleCard } from '@/components/ArticleCard';

// Shared homepage rail: heading + optional subtitle/"View All" link, then a
// card grid. Used by every editorial-type-driven section except Face of the
// Heat (its own artist-forward layout) and Heat Check (Spotify embed).
export function EditorialSection({
  heading,
  subtitle,
  viewAllHref,
  articles,
}: {
  heading: string;
  subtitle?: string;
  viewAllHref?: string;
  articles: ArticleSummary[];
}) {
  if (articles.length === 0) return null;

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4 border-b-2 border-neutral-900 pb-2">
        <div>
          <h2 className="text-xl font-extrabold uppercase tracking-wide">{heading}</h2>
          {subtitle ? <p className="mt-1 text-sm text-neutral-500">{subtitle}</p> : null}
        </div>
        {viewAllHref ? (
          <Link href={viewAllHref} className="shrink-0 text-sm font-semibold text-red-600 hover:underline">
            View All &rarr;
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
