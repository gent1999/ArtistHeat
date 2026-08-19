import { getSessionToken } from '@/lib/session';
import { api } from '@/lib/api';
import { NewArticleForm } from './NewArticleForm';

export default async function NewArticlePage() {
  const token = (await getSessionToken())!;
  const [{ authors }, { categories }, { tags }, { admin }] = await Promise.all([
    api.listAuthors(token),
    api.listCategories(),
    api.listTags(token),
    api.me(token),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">New Article</h1>
      <NewArticleForm
        authors={authors}
        categories={categories}
        existingTagNames={tags.map((t) => t.name)}
        canFeature={admin.role === 'admin'}
      />
    </div>
  );
}
