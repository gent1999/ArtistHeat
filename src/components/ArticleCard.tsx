import Link from 'next/link';
import type { ArticleSummary } from '@/lib/api';
import { formatDate, primaryCategoryOf } from '@/lib/format';

export function ArticleCard({ article }: { article: ArticleSummary }) {
  const primaryCategory = primaryCategoryOf(article);

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
        {primaryCategory ? (
          <Link
            href={`/category/${primaryCategory.slug}`}
            className="text-xs font-semibold uppercase tracking-wide text-red-600 hover:underline"
          >
            {primaryCategory.name}
          </Link>
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
