'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateAdsEnabledAction } from '../../actions';

export function AdsEnabledToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    const next = !enabled;
    setEnabled(next);
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      if (next) fd.set('adsEnabled', 'on');
      const result = await updateAdsEnabledAction(fd);
      if (result.error) {
        setEnabled(!next);
        setError(result.error);
      }
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-3 border border-neutral-200 px-4 py-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={enabled}
        aria-label="Toggle homepage ads"
        className={`relative inline-flex h-6 w-11 shrink-0 items-center transition-colors disabled:opacity-50 ${
          enabled ? 'bg-red-600' : 'bg-neutral-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
      <div>
        <p className="text-sm font-medium">{enabled ? 'Ads are ON' : 'Ads are OFF'}</p>
        <p className="text-xs text-neutral-500">Shows the native banner ad column on the homepage.</p>
      </div>
      {error ? <p className="ml-auto text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
