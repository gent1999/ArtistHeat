'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdBanner } from '@/lib/api';
import { toggleAdBannerAction, deleteAdBannerAction, reorderAdBannersAction } from '../../actions';
import { AdBannerEditModal } from './AdBannerEditModal';

function BannerRow({
  ad,
  isFirst,
  isLast,
  onMove,
  movePending,
}: {
  ad: AdBanner;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: 'up' | 'down') => void;
  movePending: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    setError(null);
    startTransition(async () => {
      const result = await toggleAdBannerAction(ad.id, !ad.isActive);
      if (result.error) setError(result.error);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!window.confirm('Delete this ad? This cannot be undone.')) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAdBannerAction(ad.id);
      if (result.error) setError(result.error);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-4 border-b border-neutral-100 py-4">
      <div className="flex shrink-0 flex-col">
        <button
          type="button"
          aria-label="Move up"
          onClick={() => onMove('up')}
          disabled={isFirst || movePending}
          className="px-1.5 py-0.5 text-xs text-neutral-500 hover:text-red-600 disabled:opacity-30"
        >
          ▲
        </button>
        <button
          type="button"
          aria-label="Move down"
          onClick={() => onMove('down')}
          disabled={isLast || movePending}
          className="px-1.5 py-0.5 text-xs text-neutral-500 hover:text-red-600 disabled:opacity-30"
        >
          ▼
        </button>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ad.imageUrl} alt={ad.title || 'Ad'} className="h-16 w-16 shrink-0 border border-neutral-200 object-cover" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{ad.title || <span className="italic text-neutral-400">No caption</span>}</p>
        <a
          href={ad.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-xs text-red-600 hover:underline"
        >
          {ad.linkUrl}
        </a>
        <span
          className={
            ad.isActive
              ? 'mt-1 inline-block bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700'
              : 'mt-1 inline-block bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-600'
          }
        >
          {ad.isActive ? 'Active' : 'Hidden'}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {error ? <span className="text-xs text-red-600">{error}</span> : null}
        <AdBannerEditModal ad={ad} />
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className="border border-neutral-300 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-600 hover:border-red-600 hover:text-red-600 disabled:opacity-50"
        >
          {ad.isActive ? 'Hide' : 'Show'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="border border-neutral-300 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500 hover:border-red-600 hover:text-red-600 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export function AdBannerList({ banners }: { banners: AdBanner[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [order, setOrder] = useState(banners);

  // Re-sync local order whenever the server gives us a fresh list (after
  // router.refresh() following a move, or a create/delete elsewhere) --
  // otherwise this component's state would get stuck showing whatever order
  // it had at mount time.
  useEffect(() => {
    setOrder(banners);
  }, [banners]);

  if (banners.length === 0) {
    return <p className="text-sm text-neutral-500">No banner ads yet -- create one above.</p>;
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= order.length) return;

    const next = [...order];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setOrder(next);

    startTransition(async () => {
      const result = await reorderAdBannersAction(next.map((ad) => ad.id));
      if (result.error) {
        setOrder(order);
        window.alert(result.error);
      }
      router.refresh();
    });
  };

  return (
    <div>
      {order.map((ad, index) => (
        <BannerRow
          key={ad.id}
          ad={ad}
          isFirst={index === 0}
          isLast={index === order.length - 1}
          onMove={(direction) => handleMove(index, direction)}
          movePending={isPending}
        />
      ))}
    </div>
  );
}
