import Link from 'next/link';
import { logoutAction } from '@/app/admin/actions';

export function AdminSidebarFooter({ adminName, adminEmail }: { adminName: string; adminEmail: string }) {
  return (
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
  );
}
