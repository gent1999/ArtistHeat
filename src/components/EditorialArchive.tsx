import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { ArticleCard } from '@/components/ArticleCard';
import { Pagination } from '@/components/Pagination';
import { canonicalWithPage } from '@/lib/site';
import type { EditorialType } from '@/lib/editorial-types';

const PAGE_SIZE = 12;

// Shared metadata/body for every editorialType-filtered archive page
// (/interviews, /artists, /music-reviews, /new-releases, ...) so adding
// another one is a ~15-line page.tsx instead of a near-duplicate route.
export function editorialArchiveMetadata({
  path,
  heading,
  description,
  page,
}: {
  path: string;
  heading: string;
  description: string;
  page: number;
}): Metadata {
  return {
    title: heading,
    description,
    alternates: { canonical: canonicalWithPage(path, page) },
  };
}

export async function EditorialArchive({
  editorialType,
  path,
  heading,
  description,
  page,
}: {
  editorialType: EditorialType;
  path: string;
  heading: string;
  description: string;
  page: number;
}) {
  const { articles, pagination } = await api.listArticles({ editorialType, page, pageSize: PAGE_SIZE });

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10">
      <h1 className="mb-2 text-3xl font-black">{heading}</h1>
      <p className="mb-8 max-w-2xl text-neutral-600">{description}</p>

      {articles.length === 0 ? (
        <p className="text-neutral-500">Nothing here yet -- check back soon.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <Pagination basePath={path} pagination={pagination} />
        </>
      )}
    </div>
  );
}
