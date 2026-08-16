'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { StarIcon } from '@/components/icons';
import { setFeaturedLevelAction, type FeaturedLevel } from '../../actions';

function levelOf(isFeatured: boolean, featuredOrder: number | null | undefined): FeaturedLevel {
  if (!isFeatured) return 0;
  return featuredOrder === 1 ? 2 : 1;
}

const LABELS: Record<FeaturedLevel, string> = {
  0: 'Not featured -- click to feature',
  1: 'Featured -- click to make the big hero feature',
  2: 'Big hero feature -- click to remove from featured',
};

export function FeaturedStarToggle({
  articleId,
  isFeatured,
  featuredOrder,
}: {
  articleId: number;
  isFeatured: boolean;
  featuredOrder: number | null | undefined;
}) {
  // Deliberately NOT copied into local state on mount: this button's
  // displayed level always reflects the server-confirmed props for THIS
  // render. A different row's action (e.g. promoting a new hero) changes
  // this article's data server-side; router.refresh() after every click
  // re-fetches the page so every row picks up whatever actually happened,
  // rather than each row tracking its own disconnected local state that
  // can drift from reality.
  const level = levelOf(isFeatured, featuredOrder);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    const nextLevel = ((level + 1) % 3) as FeaturedLevel;
    setError(null);
    startTransition(async () => {
      const result = await setFeaturedLevelAction(articleId, nextLevel);
      if (result.error) setError(result.error);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        title={LABELS[level]}
        aria-label={LABELS[level]}
        className={`flex items-center gap-0.5 px-1.5 py-1 disabled:opacity-50 ${
          level > 0 ? 'bg-yellow-50 text-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]' : 'text-neutral-300 hover:text-neutral-400'
        }`}
      >
        <StarIcon filled={level >= 1} />
        {level === 2 ? <StarIcon filled className="-ml-1" /> : null}
      </button>
    </div>
  );
}
