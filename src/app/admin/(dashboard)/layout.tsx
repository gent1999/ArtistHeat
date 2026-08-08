import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ApiError, api } from '@/lib/api';
import { getSessionToken } from '@/lib/session';
import { logoutAction } from '../actions';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const token = await getSessionToken();
  if (!token) redirect('/admin/login');

  let adminName: string;
  try {
    const { admin } = await api.me(token);
    adminName = admin.name;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/admin/login');
    throw err;
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-6xl gap-8 px-4 py-8">
      <aside className="w-48 shrink-0">
        <nav className="flex flex-col gap-2 text-sm font-medium">
          <Link href="/admin" className="px-2 py-1.5 hover:bg-neutral-100">
            Dashboard
          </Link>
          <Link href="/admin/articles" className="px-2 py-1.5 hover:bg-neutral-100">
            Articles
          </Link>
        </nav>
        <div className="mt-8 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
          <p className="mb-2">{adminName}</p>
          <form action={logoutAction}>
            <button type="submit" className="text-red-600 hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
