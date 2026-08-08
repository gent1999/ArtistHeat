import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { api, ApiError } from '@/lib/api';

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

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await loadArticle(slug);
  if (!article) notFound();

  const primaryCategory = article.articleCategories?.find((c) => c.isPrimary)?.category
    ?? article.articleCategories?.[0]?.category;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        {primaryCategory ? (
          <Link href={`/category/${primaryCategory.slug}`} className="text-xs font-semibold uppercase tracking-wide text-red-600 hover:underline">
            {primaryCategory.name}
          </Link>
        ) : null}
        <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{article.title}</h1>
        <div className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
          {article.author ? (
            <Link href={`/author/${article.author.slug}`} className="font-medium hover:underline">
              {article.author.name}
            </Link>
          ) : null}
          {article.publishedAt ? <span>&middot; {formatDate(article.publishedAt)}</span> : null}
        </div>
      </header>

      {article.featuredImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.featuredImage.sourceUrl}
          alt={article.featuredImage.altText || article.title}
          className="mb-8 w-full object-cover"
        />
      ) : null}

      <div
        className="prose prose-neutral max-w-none prose-headings:font-bold prose-a:text-red-600"
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
  );
}
