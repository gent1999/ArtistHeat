import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate, primaryCategoryOf } from '@/lib/format';

export async function ArticleLatestPosts({ excludeArticleId }: { excludeArticleId: number }) {
  const { articles } = await api.listArticles({ pageSize: 6 });
  const posts = articles.filter((a) => a.id !== excludeArticleId).slice(0, 4);
  if (posts.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-lg font-extrabold uppercase tracking-wide text-red-600">Latest Posts</h2>
      <div className="flex flex-col gap-4">
        {posts.map((article) => {
          const category = primaryCategoryOf(article);
          return (
            <Link key={article.id} href={`/${article.slug}`} className="group flex gap-3">
              <span className="relative block h-20 w-24 shrink-0 overflow-hidden bg-neutral-100">
                {article.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.featuredImage.sourceUrl}
                    alt={article.featuredImage.altText || article.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : null}
                {category ? (
                  <span className="absolute top-1 left-1 bg-red-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                    {category.name}
                  </span>
                ) : null}
              </span>
              <div className="min-w-0">
                <h3 className="line-clamp-3 text-sm font-semibold leading-snug group-hover:text-red-600">{article.title}</h3>
                {article.publishedAt ? <div className="mt-1 text-xs text-neutral-500">{formatDate(article.publishedAt)}</div> : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
