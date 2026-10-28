import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { ArticleCard } from '@/components/ArticleCard';
import { Pagination } from '@/components/Pagination';
import { SearchForm } from '@/components/SearchForm';

const PAGE_SIZE = 12;
const PATH = '/search';

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : 'Search' };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, page } = await searchParams;
  const query = q?.trim() ?? '';
  const pageNum = Number(page) || 1;

  const { articles, pagination } = query
    ? await api.listArticles({ q: query, page: pageNum, pageSize: PAGE_SIZE })
    : { articles: [], pagination: { page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 0 } };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10">
      <h1 className="mb-6 text-3xl font-black">Search</h1>
      <SearchForm initialQuery={query} />

      {!query ? null : articles.length === 0 ? (
        <p className="mt-10 text-neutral-500">No results for &ldquo;{query}&rdquo;.</p>
      ) : (
        <>
          <p className="mt-8 mb-6 text-sm text-neutral-500">
            {pagination.total} result{pagination.total === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
          </p>
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <Pagination basePath={PATH} pagination={pagination} extraQuery={{ q: query }} />
        </>
      )}
    </div>
  );
}
