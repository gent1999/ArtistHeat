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
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-neutral-200 px-6 py-3">
        <Link href="/admin">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ArtistHeat" className="h-8 w-auto" />
        </Link>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-8">
        <aside className="w-48 shrink-0">
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <Link href="/admin" className="border-l-2 border-transparent px-3 py-1.5 hover:border-red-600 hover:bg-red-50 hover:text-red-600">
              Dashboard
            </Link>
            <Link
              href="/admin/articles/new"
              className="border-l-2 border-transparent px-3 py-1.5 hover:border-red-600 hover:bg-red-50 hover:text-red-600"
            >
              New Article
            </Link>
            <Link
              href="/admin/articles"
              className="border-l-2 border-transparent px-3 py-1.5 hover:border-red-600 hover:bg-red-50 hover:text-red-600"
            >
              Articles
            </Link>
          </nav>
          <div className="mt-8 border-t border-neutral-200 px-3 pt-4 text-xs text-neutral-500">
            <p className="mb-2">{adminName}</p>
            <form action={logoutAction}>
              <button type="submit" className="font-semibold text-red-600 hover:underline">
                Sign out
              </button>
            </form>
          </div>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
