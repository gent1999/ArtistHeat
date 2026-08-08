import Link from 'next/link';
import { api } from '@/lib/api';

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
          <li key={article.id} className="flex gap-3">
            <span className="text-lg font-black text-neutral-300">{i + 1}</span>
            <Link href={`/${article.slug}`} className="text-sm font-semibold leading-snug hover:text-red-600">
              {article.title}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
