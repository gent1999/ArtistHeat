import Link from 'next/link';
import type { Pagination as PaginationData } from '@/lib/api';

// Simple prev/next + page-number pager. Links are plain `?page=N` query
// params (SEO-friendly, crawlable, no client JS required to navigate).
export function Pagination({ basePath, pagination }: { basePath: string; pagination: PaginationData }) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const href = (p: number) => (p <= 1 ? basePath : `${basePath}?page=${p}`);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2 text-sm font-semibold">
      {page > 1 ? (
        <Link href={href(page - 1)} className="border border-neutral-300 px-3 py-1.5 hover:border-red-600 hover:text-red-600">
          &larr; Prev
        </Link>
      ) : null}
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? 'page' : undefined}
          className={
            p === page ? 'bg-red-600 px-3 py-1.5 text-white' : 'border border-neutral-300 px-3 py-1.5 hover:border-red-600 hover:text-red-600'
          }
        >
          {p}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={href(page + 1)} className="border border-neutral-300 px-3 py-1.5 hover:border-red-600 hover:text-red-600">
          Next &rarr;
        </Link>
      ) : null}
    </nav>
  );
}
