'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/admin/finance', label: 'Overview' },
  { href: '/admin/finance/transactions', label: 'Transactions' },
  { href: '/admin/finance/sources', label: 'Sources' },
];

// The main admin sidebar has no mobile collapse at all (fixed w-60, always
// visible) -- finance/layout.tsx hides it below `lg` and uses this compact
// strip instead, without touching that sidebar's behavior on any other
// admin page. `relative` is explicit (not load-bearing today, since this
// shell has no `position: fixed` overlay) as cheap insurance against the
// exact stacking bug where a fixed decorative layer paints over a later,
// non-positioned sibling regardless of DOM order.
export function FinanceMobileTabs() {
  const pathname = usePathname();

  return (
    <nav className="relative flex shrink-0 border-b border-neutral-200 bg-white lg:hidden">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 border-b-2 px-3 py-2.5 text-center text-xs font-bold tracking-wide uppercase ${
              active ? 'border-red-600 text-red-600' : 'border-transparent text-neutral-500'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
