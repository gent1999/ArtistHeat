import { notFound, redirect } from 'next/navigation';
import { getSessionToken } from '@/lib/session';
import { ApiError, api } from '@/lib/api';
import { EditArticleForm } from './EditArticleForm';

export default async function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = (await getSessionToken())!;

  // Editing existing articles is a full-admin-only page -- an "editor"
  // account only gets Dashboard / New Article / Articles (view).
  const { admin } = await api.me(token);
  if (admin.role !== 'admin') redirect('/admin/articles');

  let article;
  try {
    ({ article } = await api.getArticle(slug, token));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const [{ authors }, { categories }, { tags }] = await Promise.all([
    api.listAuthors(token),
    api.listCategories(),
    api.listTags(token),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Article</h1>
      <EditArticleForm article={article} authors={authors} categories={categories} existingTagNames={tags.map((t) => t.name)} />
    </div>
  );
}
