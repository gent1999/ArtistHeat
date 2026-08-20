import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ApiError, api } from '@/lib/api';
import { getSessionToken } from '@/lib/session';
import { logoutAction } from '../actions';

const navLinkClass =
  'flex items-center justify-between border-l-2 border-transparent px-3 py-1.5 text-sm font-medium text-neutral-700 hover:border-red-600 hover:bg-red-50 hover:text-red-600';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 mb-1 px-3 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">{children}</p>;
}

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const token = await getSessionToken();
  if (!token) redirect('/admin/login');

  let adminName: string;
  let adminEmail: string;
  let isAdmin: boolean;
  try {
    const { admin } = await api.me(token);
    adminName = admin.name;
    adminEmail = admin.email;
    isAdmin = admin.role === 'admin';
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/admin/login');
    throw err;
  }

  const { pagination } = await api.listArticles({ pageSize: 1 }, token);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-neutral-200 bg-white">
        <Link href="/admin" className="flex shrink-0 items-center gap-2 border-b border-neutral-200 px-4 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ArtistHeat" className="h-8 w-auto" />
          <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">Command Center</span>
        </Link>

        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          <SectionLabel>Content</SectionLabel>
          <Link href="/admin/articles/new" className={navLinkClass}>
            New Article
          </Link>
          <Link href="/admin/articles" className={navLinkClass}>
            <span>All Articles</span>
            <span className="text-xs text-neutral-400">{pagination.total}</span>
          </Link>

          {isAdmin ? (
            <>
              <SectionLabel>Admin</SectionLabel>
              <Link href="/admin/users" className={navLinkClass}>
                Users
              </Link>
            </>
          ) : null}
        </nav>

        <div className="shrink-0 border-t border-neutral-200 px-3 py-4 text-xs">
          <p className="font-semibold text-neutral-800">{adminName}</p>
          <p className="mb-3 text-neutral-500">{adminEmail}</p>
          <div className="flex flex-col gap-1.5">
            <Link href="/" target="_blank" className="font-semibold text-neutral-600 hover:text-red-600">
              View Site
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="font-semibold text-red-600 hover:underline">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-6 py-2 text-xs font-medium text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 bg-red-600" />
            {pagination.total} articles
          </span>
        </header>
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">{children}</main>
      </div>
    </div>
  );
}
