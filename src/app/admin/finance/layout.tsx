import Link from 'next/link';
import { requireAdminSession } from '@/lib/admin-session';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminSidebarFooter } from '@/components/admin/AdminSidebarFooter';
import { FinanceMobileTabs } from '@/components/admin/finance/FinanceMobileTabs';

// Deliberately its own top-level shell (a sibling of (dashboard), not
// nested inside it) rather than reusing (dashboard)/layout.tsx directly --
// Finance needs its sidebar to go `hidden lg:flex` with a mobile tab strip
// in its place, and the brief is explicit that every *other* admin page's
// sidebar should stay exactly as it is. AdminNav/AdminSidebarFooter keep
// the actual nav content shared between the two shells either way.
export default async function FinanceLayout({ children }: { children: React.ReactNode }) {
  const { adminName, adminEmail, isAdmin, articleCount } = await requireAdminSession();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-neutral-200 bg-white lg:flex">
        <Link href="/admin" className="flex shrink-0 items-center gap-2 border-b border-neutral-200 px-4 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ArtistHeat" className="h-8 w-auto" />
          <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">Command Center</span>
        </Link>

        <AdminNav isAdmin={isAdmin} articleCount={articleCount} />
        <AdminSidebarFooter adminName={adminName} adminEmail={adminEmail} />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <FinanceMobileTabs />
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">{children}</main>
      </div>
    </div>
  );
}
