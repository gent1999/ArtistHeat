'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdBanner } from '@/lib/api';
import { toggleAdBannerAction, deleteAdBannerAction } from '../../actions';

function BannerRow({ ad }: { ad: AdBanner }) {
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
  if (banners.length === 0) {
    return <p className="text-sm text-neutral-500">No banner ads yet -- create one above.</p>;
  }

  return (
    <div>
      {banners.map((ad) => (
        <BannerRow key={ad.id} ad={ad} />
      ))}
    </div>
  );
}
