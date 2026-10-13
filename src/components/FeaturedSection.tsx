'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { ArticleSummary } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { ArticleImageCorners } from '@/components/ArticleImageCorners';

// The hero is a fixed 440px tall at lg+ (see FeaturedHero's lg:h-[440px]);
// the 3 stacked side cards need to sum to exactly that (440 = 3 cards + 2
// gap-4 gaps -> 136px each, see FeaturedSideCard's lg:h-[136px]).
// Flexbox's default `min-height: auto` fights flex-1 evenly splitting a
// column of items, so rather than relying on that, both heights are
// explicit -- if the hero height ever changes, recompute (h - 32) / 3.

function FeaturedBadge() {
  return (
    <span className="inline-block w-fit bg-red-600 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">
      Featured
    </span>
  );
}

function FeaturedHero({ article }: { article: ArticleSummary }) {
  return (
    <Link
      href={`/${article.slug}`}
      className="group relative block aspect-[4/3] bg-neutral-900 sm:aspect-[16/11] lg:aspect-auto lg:h-[440px]"
    >
      <div className="absolute inset-0 overflow-hidden">
        {article.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.featuredImage.sourceUrl}
            alt={article.featuredImage.altText || article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6">
          <FeaturedBadge />
          <h2 className="text-2xl font-[540] leading-tight text-white sm:text-3xl">{article.title}</h2>
          <div className="flex items-center gap-2 text-sm text-neutral-200">
            {article.author ? <span className="font-medium">{article.author.name}</span> : null}
            {article.publishedAt ? <span>&middot; {formatDate(article.publishedAt)}</span> : null}
          </div>
        </div>
      </div>
      <ArticleImageCorners />
    </Link>
  );
}

function FeaturedSideCard({ article }: { article: ArticleSummary }) {
  return (
    <Link
      href={`/${article.slug}`}
      className="group relative flex h-full min-h-[110px] bg-neutral-900 lg:h-[136px] lg:min-h-0"
    >
      <div className="absolute inset-0 overflow-hidden">
        {article.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.featuredImage.sourceUrl}
            alt={article.featuredImage.altText || article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4">
          <span className="inline-block w-fit bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Featured
          </span>
          <h3 className="text-sm font-[520] leading-snug text-white line-clamp-2">{article.title}</h3>
          <div className="text-xs text-neutral-300">
            {article.author?.name}
            {article.publishedAt ? <span> &middot; {formatDate(article.publishedAt)}</span> : null}
          </div>
        </div>
      </div>
      <ArticleImageCorners />
    </Link>
  );
}

// Rotates the featured rail every ROTATION_INTERVAL_MS: the top side card
// (1-star) becomes the new hero, the old hero drops to the bottom of the
// 3-card stack, and the other two side cards each bump up one spot -- a
// plain rotate-by-one on the array. FADE_MS is just the crossfade's own
// duration, kept short relative to the interval so the swap reads as a
// quick beat rather than a slow morph.
const ROTATION_INTERVAL_MS = 5000;
const FADE_MS = 400;
const MAX_FEATURED = 4;

export function FeaturedSection({ articles }: { articles: ArticleSummary[] }) {
  const rotatable = articles.slice(0, MAX_FEATURED);
  // Stable string key for the *set* of featured articles, so the effects
  // below resync/restart only when admin actually changes what's featured
  // -- not on every rotation tick (which would otherwise reset the timer).
  const key = rotatable.map((a) => a.id).join(',');

  const [order, setOrder] = useState(rotatable);
  const [fading, setFading] = useState(false);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOrder(rotatable);
    setFading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (rotatable.length < 2) return;

    const interval = setInterval(() => {
      setFading(true);
      fadeTimeout.current = setTimeout(() => {
        setOrder((prev) => (prev.length < 2 ? prev : [...prev.slice(1), prev[0]]));
        setFading(false);
      }, FADE_MS);
    }, ROTATION_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (order.length === 0) return null;
  const [hero, ...rest] = order;
  const sideArticles = rest.slice(0, 3);

  return (
    <section
      className={`grid grid-cols-1 gap-4 transition-opacity ease-in-out lg:grid-cols-[7fr_2fr] ${fading ? 'opacity-0' : 'opacity-100'}`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <FeaturedHero article={hero} />
      {sideArticles.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:flex lg:flex-col">
          {sideArticles.map((article) => (
            <FeaturedSideCard key={article.id} article={article} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
