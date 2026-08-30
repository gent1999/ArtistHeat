import Link from 'next/link';
import type { ArticleSummary } from '@/lib/api';
import { formatDate, primaryCategoryOf } from '@/lib/format';
import { editorialTypeLabelsOf } from '@/lib/editorial-types';

export function ArticleCard({ article }: { article: ArticleSummary }) {
  const primaryCategory = primaryCategoryOf(article);
  // Cards stay subtle -- show only the first editorial type even if the
  // article carries several; the full set shows on the article page itself.
  const editorialLabel = editorialTypeLabelsOf(article)[0] ?? null;

  return (
    <article className="group flex flex-col gap-3">
      <Link href={`/${article.slug}`} className="block overflow-hidden bg-neutral-100 aspect-[16/10]">
        {article.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.featuredImage.sourceUrl}
            alt={article.featuredImage.altText || article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </Link>
      <div className="flex flex-col gap-1.5">
        {primaryCategory || editorialLabel ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
            {primaryCategory ? (
              <Link href={`/category/${primaryCategory.slug}`} className="text-red-600 hover:underline">
                {primaryCategory.name}
              </Link>
            ) : null}
            {primaryCategory && editorialLabel ? <span className="text-neutral-300">&middot;</span> : null}
            {editorialLabel ? <span className="text-neutral-500">{editorialLabel}</span> : null}
          </div>
        ) : null}
        <h3 className="text-lg font-semibold leading-snug">
          <Link href={`/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h3>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          {article.author ? <span>{article.author.name}</span> : null}
          {article.publishedAt ? <span>&middot; {formatDate(article.publishedAt)}</span> : null}
        </div>
      </div>
    </article>
  );
}
