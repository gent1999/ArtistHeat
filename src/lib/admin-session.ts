import { redirect } from 'next/navigation';
import { ApiError, api } from './api';
import { getSessionToken } from './session';

// Shared by every admin shell layout ((dashboard)/layout.tsx and
// finance/layout.tsx) so the auth-check/admin-info-fetch logic lives in
// exactly one place even though the two shells render their own markup.
export async function requireAdminSession() {
  const token = await getSessionToken();
  if (!token) redirect('/admin/login');

  try {
    const [{ admin }, { pagination }] = await Promise.all([api.me(token), api.listArticles({ pageSize: 1 }, token)]);
    return {
      token,
      adminName: admin.name,
      adminEmail: admin.email,
      isAdmin: admin.role === 'admin',
      articleCount: pagination.total,
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/admin/login');
    throw err;
  }
}
