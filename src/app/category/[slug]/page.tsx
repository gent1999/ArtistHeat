import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ApiError, api } from '@/lib/api';
import { ArticleCard } from '@/components/ArticleCard';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function loadCategory(slug: string, page: number) {
  try {
    return await api.getCategory(slug, page);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await loadCategory(slug, 1);
  return { title: category.name, description: category.description || undefined };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;
  const { category, articles } = await loadCategory(slug, Number(page) || 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-black">{category.name}</h1>
      {category.description ? <p className="mb-8 max-w-2xl text-neutral-600">{category.description}</p> : null}
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
