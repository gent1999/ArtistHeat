'use client';

import { useMemo, useState, useTransition } from 'react';
import { formatDate } from '@/lib/format';
import { updateSubmissionStatusAction } from '../../actions';
import type { MusicSubmission } from '@/lib/api';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

const FILTERS: Filter[] = ['all', 'pending', 'approved', 'rejected'];

const typeStyle: Record<string, string> = {
  priority: 'bg-red-100 text-red-700',
  free: 'bg-neutral-100 text-neutral-600',
};

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-neutral-200 text-neutral-500',
};

function fmtPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function SubmissionsTable({ submissions }: { submissions: MusicSubmission[] }) {
  const [filter, setFilter] = useState<Filter>('pending');
  const [selected, setSelected] = useState<MusicSubmission | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const filtered = useMemo(
    () => submissions.filter((s) => (filter === 'all' ? true : s.submissionStatus === filter)),
    [submissions, filter]
  );

  function setStatus(id: number, status: 'pending' | 'approved' | 'rejected') {
    setError('');
    startTransition(async () => {
      const res = await updateSubmissionStatusAction(id, status);
      if (res.error) setError(res.error);
      else setSelected(null);
    });
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? 'border border-red-600 bg-red-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-red-600'
                : 'border border-neutral-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500 hover:border-neutral-400'
            }
          >
            {f}
          </button>
        ))}
        <span className="text-xs text-neutral-400">{filtered.length} shown</span>
      </div>

      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">{submissions.length === 0 ? 'No submissions yet.' : 'No results.'}</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500">
              <th className="py-2 font-medium">Artist / Title</th>
              <th className="py-2 font-medium">Type</th>
              <th className="py-2 font-medium">Amount</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Submitted</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-neutral-100">
                <td className="py-2">
                  <div className="font-medium text-neutral-900">{s.artistName}</div>
                  <div className="text-xs text-neutral-500">&ldquo;{s.title}&rdquo;</div>
                </td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 text-xs font-semibold uppercase ${typeStyle[s.submissionType]}`}>
                    {s.submissionType === 'priority' ? '💰 Paid' : '🆓 Free'}
                  </span>
                </td>
                <td className="py-2 font-mono text-xs">{fmtPrice(s.paymentAmount)}</td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 text-xs font-semibold uppercase ${statusStyle[s.submissionStatus]}`}>{s.submissionStatus}</span>
                </td>
                <td className="py-2 text-xs text-neutral-600">{formatDate(s.createdAt)}</td>
                <td className="py-2 text-right">
                  <button onClick={() => setSelected(s)} className="text-xs font-semibold text-red-600 hover:underline">
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <h2 className="text-base font-bold text-neutral-900">{selected.artistName}</h2>
              <button onClick={() => setSelected(null)} className="text-neutral-400 hover:text-neutral-700">
                ✕
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 text-xs font-semibold uppercase ${typeStyle[selected.submissionType]}`}>
                  {selected.submissionType === 'priority' ? '💰 Paid' : '🆓 Free'}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold uppercase ${statusStyle[selected.submissionStatus]}`}>{selected.submissionStatus}</span>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wide text-neutral-400 uppercase">Contact</p>
                <p className="text-sm">
                  {selected.email} &middot; {selected.title}
                </p>
              </div>

              {selected.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.imageUrl} alt="" className="max-h-56 w-full border border-neutral-200 object-contain" />
              ) : null}

              <div>
                <p className="text-xs font-semibold tracking-wide text-neutral-400 uppercase">About the sound</p>
                <p className="text-sm whitespace-pre-wrap text-neutral-700">{selected.content}</p>
              </div>

              <div className="space-y-1 text-sm">
                {selected.spotifyUrl ? (
                  <a href={selected.spotifyUrl} target="_blank" rel="noopener noreferrer" className="block text-red-600 hover:underline">
                    Spotify ↗
                  </a>
                ) : null}
                {selected.youtubeUrl ? (
                  <a href={selected.youtubeUrl} target="_blank" rel="noopener noreferrer" className="block text-red-600 hover:underline">
                    YouTube ↗
                  </a>
                ) : null}
                {selected.soundcloudUrl ? (
                  <a href={selected.soundcloudUrl} target="_blank" rel="noopener noreferrer" className="block text-red-600 hover:underline">
                    SoundCloud ↗
                  </a>
                ) : null}
                {selected.appleMusicUrl ? (
                  <a href={selected.appleMusicUrl} target="_blank" rel="noopener noreferrer" className="block text-red-600 hover:underline">
                    Apple Music ↗
                  </a>
                ) : null}
              </div>

              <div className="border border-neutral-200 p-3 text-xs">
                <div className="flex justify-between py-0.5">
                  <span className="text-neutral-500">Amount</span>
                  <span className="font-semibold">{fmtPrice(selected.paymentAmount)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-neutral-500">Payment Status</span>
                  <span>{selected.paymentStatus}</span>
                </div>
                {selected.stripeSessionId ? (
                  <div className="flex justify-between gap-3 py-0.5">
                    <span className="flex-shrink-0 text-neutral-500">Session</span>
                    <span className="truncate">{selected.stripeSessionId}</span>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex gap-2 border-t border-neutral-200 px-5 py-4">
              {selected.submissionStatus !== 'approved' && (
                <button
                  disabled={isPending}
                  onClick={() => setStatus(selected.id, 'approved')}
                  className="flex-1 bg-red-600 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Approve
                </button>
              )}
              {selected.submissionStatus !== 'rejected' && (
                <button
                  disabled={isPending}
                  onClick={() => setStatus(selected.id, 'rejected')}
                  className="flex-1 border border-neutral-300 py-2 text-xs font-bold uppercase tracking-wide text-neutral-700 hover:border-neutral-400 disabled:opacity-50"
                >
                  Reject
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
