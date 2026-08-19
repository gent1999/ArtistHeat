import Link from 'next/link';
import { getSessionToken } from '@/lib/session';
import { api } from '@/lib/api';
import { FeaturedStarToggle } from './FeaturedStarToggle';

export default async function AdminArticlesPage() {
  const token = (await getSessionToken())!;
  const [{ articles }, { admin }] = await Promise.all([api.listArticles({ pageSize: 50 }, token), api.me(token)]);
  const isAdmin = admin.role === 'admin';

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Articles</h1>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-neutral-500">
            <th className="py-2 font-medium">Title</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium">Author</th>
            {isAdmin ? <th className="py-2 text-right font-medium">Featured</th> : null}
            {isAdmin ? <th className="py-2 text-right font-medium">Edit</th> : null}
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
              <td className="py-2 text-neutral-600">
                {article.author?.name ?? '—'}
                {article.publishedByAdmin ? (
                  <div className="text-xs text-neutral-400">posted by {article.publishedByAdmin.email}</div>
                ) : null}
              </td>
              {isAdmin ? (
                <td className="py-2">
                  <FeaturedStarToggle articleId={article.id} isFeatured={Boolean(article.isFeatured)} featuredOrder={article.featuredOrder} />
                </td>
              ) : null}
              {isAdmin ? (
                <td className="py-2 text-right">
                  <Link href={`/admin/articles/${article.slug}/edit`} className="text-xs font-semibold text-red-600 hover:underline">
                    Edit
                  </Link>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
