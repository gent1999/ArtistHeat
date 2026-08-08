import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ApiError, api } from '@/lib/api';
import { ArticleCard } from '@/components/ArticleCard';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function loadTag(slug: string, page: number) {
  try {
    return await api.getTag(slug, page);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { tag } = await loadTag(slug, 1);
  return { title: `#${tag.name}` };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;
  const { tag, articles } = await loadTag(slug, Number(page) || 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-black">#{tag.name}</h1>
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
