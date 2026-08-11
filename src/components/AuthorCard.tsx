import Link from 'next/link';

export function AuthorCard({ author }: { author: { name: string; slug: string } }) {
  return (
    <Link href={`/author/${author.slug}`} className="flex items-center gap-3 bg-orange-50 p-5 hover:bg-orange-100">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-white text-neutral-400">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
        </svg>
      </span>
      <span className="font-semibold">{author.name}</span>
    </Link>
  );
}
