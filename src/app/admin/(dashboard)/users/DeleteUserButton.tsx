'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteUserAction } from '../../actions';

export function DeleteUserButton({ userId, userLabel }: { userId: number; userLabel: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    if (!window.confirm(`Delete ${userLabel}? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (result.error) setError(result.error);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-xs font-semibold text-neutral-500 hover:text-red-600 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
