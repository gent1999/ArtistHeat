import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';

// Same honesty note as TrendingBar: no real view-tracking yet, so "trending"
// is the most recently published articles rather than a fabricated signal.
export async function TrendingThisWeek() {
  const { articles } = await api.listArticles({ pageSize: 5 });
  if (articles.length === 0) return null;

  return (
    <div className="border border-neutral-200 p-5">
      <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wide">Trending This Week</h2>
      <ol className="flex flex-col gap-3">
        {articles.map((article, i) => (
          <li key={article.id} className="flex items-center gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-red-600 text-xs font-bold text-white">
              {i + 1}
            </span>
            <Link href={`/${article.slug}`} className="shrink-0 bg-neutral-100">
              {article.featuredImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.featuredImage.sourceUrl}
                  alt={article.featuredImage.altText || article.title}
                  className="h-14 w-14 object-cover"
                />
              ) : (
                <div className="h-14 w-14" />
              )}
            </Link>
            <div className="min-w-0">
              <Link href={`/${article.slug}`} className="line-clamp-2 text-sm font-semibold leading-snug hover:text-red-600">
                {article.title}
              </Link>
              {article.publishedAt ? <div className="mt-1 text-xs text-neutral-500">{formatDate(article.publishedAt)}</div> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
