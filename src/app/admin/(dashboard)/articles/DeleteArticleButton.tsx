'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteArticleAction } from '../../actions';

export function DeleteArticleButton({ articleId, articleSlug, title }: { articleId: number; articleSlug: string; title: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteArticleAction(articleId, articleSlug);
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
