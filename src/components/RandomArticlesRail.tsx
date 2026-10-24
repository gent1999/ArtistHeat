'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { ArticleSummary } from '@/lib/api';
import { primaryCategoryOf } from '@/lib/format';

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Fills the right rail with random article cards, one at a time, until it
// catches up to the bottom of the <article> content next to it -- so the
// rail keeps pace with however long the piece is instead of stopping short
// or running past it. The shuffle happens on mount (client-side), so a new
// random order shows up on every page view even though the candidate pool
// itself is server-fetched and cached.
export function RandomArticlesRail({ candidates }: { candidates: ArticleSummary[] }) {
  const [pool] = useState(() => shuffled(candidates));
  const [count, setCount] = useState(Math.min(3, pool.length));
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const articleEl = document.querySelector('article');
    const rail = railRef.current;
    if (!articleEl || !rail || count >= pool.length) return;

    const check = () => {
      const articleBottom = articleEl.getBoundingClientRect().bottom;
      const railBottom = rail.getBoundingClientRect().bottom;
      if (railBottom < articleBottom) {
        setCount((c) => Math.min(c + 1, pool.length));
      }
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(articleEl);
    window.addEventListener('resize', check);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', check);
    };
  }, [count, pool.length]);

  const visible = pool.slice(0, count);
  if (visible.length === 0) return null;

  return (
    <div ref={railRef} className="flex flex-col gap-6">
      {visible.map((article) => {
        const category = primaryCategoryOf(article);
        return (
          <Link key={article.id} href={`/${article.slug}`} className="group block">
            <span className="relative block aspect-[16/10] w-full overflow-hidden bg-neutral-100">
              {article.featuredImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.featuredImage.sourceUrl}
                  alt={article.featuredImage.altText || article.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : null}
              {category ? (
                <span className="absolute top-2 left-2 bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  {category.name}
                </span>
              ) : null}
            </span>
            <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug group-hover:text-red-600">{article.title}</h3>
            {article.excerpt ? <p className="mt-1 line-clamp-1 text-sm text-neutral-500">{article.excerpt}</p> : null}
          </Link>
        );
      })}
    </div>
  );
}
