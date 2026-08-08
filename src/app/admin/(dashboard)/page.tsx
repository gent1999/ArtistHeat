import { getSessionToken } from '@/lib/session';
import { api } from '@/lib/api';

export default async function AdminHomePage() {
  const token = (await getSessionToken())!;
  const { pagination } = await api.listArticles({ pageSize: 1, page: 1 }, token);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
      <p className="text-neutral-600">{pagination.total} articles total.</p>
    </div>
  );
}
