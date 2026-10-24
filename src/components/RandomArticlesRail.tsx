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

// lg: in Tailwind's default theme -- below this, the page stacks into a
// single column and the rail renders after (not beside) the article, so
// there's nothing to size-match against.
const DESKTOP_QUERY = '(min-width: 1024px)';

// Sizes the rail to the article in one measured pass instead of growing it
// reactively: growing one card at a time off a live ResizeObserver meant
// every image in the article body that loaded late (and nudged the
// article's height) queued up another card, so the rail visibly kept
// lengthening under the user as the page settled. Here we wait for the
// article's own images to finish loading, measure once, and set a final
// card count from the average height of whatever's already rendered --
// no further growth after that.
export function RandomArticlesRail({ candidates }: { candidates: ArticleSummary[] }) {
  const [pool] = useState(() => shuffled(candidates));
  const [count, setCount] = useState(Math.min(3, pool.length));
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pool.length === 0) return;
    if (!window.matchMedia(DESKTOP_QUERY).matches) return;

    const articleEl = document.querySelector('article');
    const rail = railRef.current;
    if (!articleEl || !rail) return;

    let cancelled = false;

    const settle = () => {
      if (cancelled) return;
      const currentCount = rail.children.length;
      if (currentCount === 0) return;
      const avgCardHeight = rail.getBoundingClientRect().height / currentCount;
      if (avgCardHeight <= 0) return;
      // Target the article's actual bottom edge, not just its raw height --
      // the rail starts lower than the article (below the newsletter box
      // and author card), so matching on height alone overshoots by
      // whatever that leading offset is.
      const targetHeight = articleEl.getBoundingClientRect().bottom - rail.getBoundingClientRect().top;
      const needed = Math.min(pool.length, Math.max(currentCount, Math.ceil(targetHeight / avgCardHeight)));
      setCount(needed);
    };

    const pendingImages = Array.from(articleEl.querySelectorAll('img')).filter((img) => !img.complete);
    let remaining = pendingImages.length;
    const onImageSettled = () => {
      remaining -= 1;
      if (remaining <= 0) settle();
    };

    if (remaining === 0) {
      settle();
    } else {
      pendingImages.forEach((img) => {
        img.addEventListener('load', onImageSettled, { once: true });
        img.addEventListener('error', onImageSettled, { once: true });
      });
    }

    // Belt-and-suspenders in case something resizes the article without an
    // <img> load event to key off of (a web font swap, an embed).
    const fallback = setTimeout(settle, 1500);

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      pendingImages.forEach((img) => {
        img.removeEventListener('load', onImageSettled);
        img.removeEventListener('error', onImageSettled);
      });
    };
  }, [pool.length]);

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
