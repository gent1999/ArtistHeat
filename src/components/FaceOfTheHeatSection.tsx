import Link from 'next/link';
import type { ArticleSummary } from '@/lib/api';
import { editorialTypeLabelsOf } from '@/lib/editorial-types';

// Portrait, image-forward cards -- deliberately taller/more photo-led than
// the standard ArticleCard grid, since this rail exists specifically to put
// artist faces front and center.
function FaceOfTheHeatCard({ article }: { article: ArticleSummary }) {
  const editorialLabel = editorialTypeLabelsOf(article)[0] ?? null;

  return (
    <Link href={`/${article.slug}`} className="group relative block aspect-[3/4] overflow-hidden bg-neutral-900">
      {article.featuredImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.featuredImage.sourceUrl}
          alt={article.featuredImage.altText || article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4">
        {editorialLabel ? (
          <span className="inline-block w-fit bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {editorialLabel}
          </span>
        ) : null}
        <h3 className="text-sm font-semibold leading-snug text-white line-clamp-2">{article.title}</h3>
      </div>
    </Link>
  );
}

export function FaceOfTheHeatSection({ articles }: { articles: ArticleSummary[] }) {
  if (articles.length === 0) return null;

  return (
    <section>
      <div className="mb-5 border-b-2 border-neutral-900 pb-2">
        <h2 className="text-xl font-extrabold uppercase tracking-wide">Face of the Heat</h2>
        <p className="mt-1 text-sm text-neutral-500">Meet the artists building what&rsquo;s next.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {articles.map((article) => (
          <FaceOfTheHeatCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
