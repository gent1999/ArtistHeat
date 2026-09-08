import Link from 'next/link';

const navLinkClass =
  'flex items-center justify-between border-l-2 border-transparent px-3 py-1.5 text-sm font-medium text-neutral-700 hover:border-red-600 hover:bg-red-50 hover:text-red-600';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 mb-1 px-3 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">{children}</p>;
}

// Shared between the main dashboard shell ((dashboard)/layout.tsx) and the
// Finance section's own shell (finance/layout.tsx) -- Finance needs its own
// layout so its sidebar can go `hidden lg:flex` on mobile without touching
// this nav for every other admin page, but the nav content itself (this
// component) is the single source of truth for both.
export function AdminNav({ isAdmin, articleCount }: { isAdmin: boolean; articleCount: number }) {
  return (
    <nav className="flex-1 overflow-y-auto px-2 pb-4">
      <SectionLabel>Content</SectionLabel>
      <Link href="/admin/articles/new" className={navLinkClass}>
        New Article
      </Link>
      <Link href="/admin/articles" className={navLinkClass}>
        <span>All Articles</span>
        <span className="text-xs text-neutral-400">{articleCount}</span>
      </Link>
      <Link href="/admin/spotify" className={navLinkClass}>
        Spotify
      </Link>

      <SectionLabel>Finance</SectionLabel>
      <Link href="/admin/finance" className={navLinkClass}>
        Overview
      </Link>
      <Link href="/admin/finance/transactions" className={navLinkClass}>
        Transactions
      </Link>
      <Link href="/admin/finance/sources" className={navLinkClass}>
        Sources
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
  );
}
