import Link from 'next/link';
import { getSessionToken } from '@/lib/session';
import { api } from '@/lib/api';
import { FeaturedStarToggle } from './FeaturedStarToggle';

export default async function AdminArticlesPage() {
  const token = (await getSessionToken())!;
  const { articles } = await api.listArticles({ pageSize: 50 }, token);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Articles</h1>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-neutral-500">
            <th className="py-2 font-medium">Title</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium">Author</th>
            <th className="py-2 text-right font-medium">Featured</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id} className="border-b border-neutral-100">
              <td className="py-2">
                <Link href={`/${article.slug}`} className="hover:underline" target="_blank">
                  {article.title}
                </Link>
              </td>
              <td className="py-2">
                <span
                  className={
                    article.status === 'published'
                      ? 'bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'
                      : 'bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600'
                  }
                >
                  {article.status}
                </span>
              </td>
              <td className="py-2 text-neutral-600">{article.author?.name ?? '—'}</td>
              <td className="py-2">
                <FeaturedStarToggle articleId={article.id} isFeatured={Boolean(article.isFeatured)} featuredOrder={article.featuredOrder} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
