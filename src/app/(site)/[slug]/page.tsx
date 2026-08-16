import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { api, ApiError } from '@/lib/api';
import { formatDate, primaryCategoryOf, estimateReadingTimeMinutes } from '@/lib/format';
import { ShareBar } from '@/components/ShareBar';
import { AuthorCard } from '@/components/AuthorCard';
import { ArticleLatestPosts } from '@/components/ArticleLatestPosts';

type Props = {
  params: Promise<{ slug: string }>;
};

async function loadArticle(slug: string) {
  try {
    const { article } = await api.getArticle(slug);
    return article;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await loadArticle(slug);
  if (!article) return {};

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || undefined;

  return {
    title,
    description,
    alternates: article.canonicalUrl ? { canonical: article.canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      images: article.ogImageUrl || article.featuredImage?.sourceUrl ? [article.ogImageUrl || article.featuredImage!.sourceUrl] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await loadArticle(slug);
  if (!article) notFound();

  const primaryCategory = primaryCategoryOf(article);
  const readingTime = estimateReadingTimeMinutes(article.content);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8">
      <nav className="mb-4 truncate text-xs font-semibold uppercase tracking-wide text-neutral-500">
        <Link href="/" className="hover:text-red-600">
          Home
        </Link>
        <span className="mx-2">&gt;</span>
        <span className="text-neutral-400">{article.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <article>
          <div className="relative block aspect-[4/3] overflow-hidden bg-neutral-900 sm:aspect-[16/9] lg:aspect-auto lg:h-[460px]">
            {article.featuredImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.featuredImage.sourceUrl}
                alt={article.featuredImage.altText || article.title}
                className="h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6">
              {article.isFeatured ? (
                <span className="inline-block w-fit bg-red-600 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">Featured</span>
              ) : primaryCategory ? (
                <Link
                  href={`/category/${primaryCategory.slug}`}
                  className="inline-block w-fit bg-red-600 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-700"
                >
                  {primaryCategory.name}
                </Link>
              ) : null}
              <h1 className="text-2xl font-semibold leading-tight text-white sm:text-4xl">{article.title}</h1>
              <div className="flex items-center gap-2 text-sm text-neutral-200">
                {article.publishedAt ? <span>{formatDate(article.publishedAt)}</span> : null}
                <span aria-hidden="true">&bull;</span>
                <span>{readingTime} min read</span>
              </div>
            </div>
          </div>

          <ShareBar title={article.title} imageUrl={article.featuredImage?.sourceUrl} />

          <div
            className="prose prose-neutral mt-8 max-w-none prose-headings:font-bold prose-a:text-red-600"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {article.articleTags.length ? (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-neutral-200 pt-6">
              {article.articleTags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          ) : null}
        </article>

        <aside className="flex flex-col gap-8">
          {article.author ? <AuthorCard author={article.author} /> : null}
          <ArticleLatestPosts excludeArticleId={article.id} />
        </aside>
      </div>
    </div>
  );
}
