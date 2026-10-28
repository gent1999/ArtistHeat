'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: { sourceUrl: string; altText: string | null } | null;
}

// Lives directly under the navbar row (see SiteHeader) so opening it pushes
// the rest of the page down -- but the results dropdown itself is
// `absolute`, floating over whatever's below (e.g. the homepage's featured
// section) instead of shoving that down too every time the result count
// changes.
export function SiteSearchBar({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    const debounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (!cancelled) setResults(data.articles ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [query]);

  const trimmedQuery = query.trim();

  function goToFullResults() {
    if (!trimmedQuery) return;
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    onClose();
  }

  return (
    <div ref={containerRef} className="relative border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-neutral-400">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') goToFullResults();
            if (e.key === 'Escape') onClose();
          }}
          placeholder="Search articles, interviews, artists..."
          className="w-full border-none text-base text-neutral-900 outline-none placeholder:text-neutral-400"
        />
        <button type="button" onClick={onClose} aria-label="Close search" className="shrink-0 text-neutral-400 hover:text-neutral-700">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>

      {trimmedQuery ? (
        <div className="absolute inset-x-0 top-full z-40 max-h-[70vh] overflow-y-auto border-b border-neutral-200 bg-white shadow-lg">
          <div className="mx-auto max-w-[1400px] px-4 py-4">
            {loading ? (
              <p className="text-sm text-neutral-500">Searching...</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-neutral-500">No results for &ldquo;{trimmedQuery}&rdquo;.</p>
            ) : (
              <>
                <ul className="flex flex-col divide-y divide-neutral-100">
                  {results.map((article) => (
                    <li key={article.id}>
                      <Link
                        href={`/${article.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-4 py-3 hover:bg-neutral-50"
                      >
                        <span className="relative block h-14 w-20 shrink-0 overflow-hidden bg-neutral-100">
                          {article.featuredImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={article.featuredImage.sourceUrl}
                              alt={article.featuredImage.altText || article.title}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </span>
                        <span className="flex flex-col gap-0.5 min-w-0">
                          <span className="line-clamp-1 text-sm font-semibold leading-snug">{article.title}</span>
                          {article.excerpt ? (
                            <span className="line-clamp-1 text-xs text-neutral-500">{article.excerpt}</span>
                          ) : null}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={goToFullResults}
                  className="mt-2 text-sm font-semibold text-red-600 hover:underline"
                >
                  See all results for &ldquo;{trimmedQuery}&rdquo; &rarr;
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
