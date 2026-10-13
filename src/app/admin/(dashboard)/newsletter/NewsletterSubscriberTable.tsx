'use client';

import { useMemo, useState } from 'react';
import { formatDate } from '@/lib/format';
import type { NewsletterSubscriber } from '@/lib/api';

type Filter = 'active' | 'inactive' | 'all';

const FILTERS: Filter[] = ['active', 'inactive', 'all'];

export function NewsletterSubscriberTable({ subscribers }: { subscribers: NewsletterSubscriber[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('active');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscribers
      .filter((s) => (filter === 'all' ? true : filter === 'active' ? s.isActive : !s.isActive))
      .filter((s) => !q || s.email.toLowerCase().includes(q));
  }, [subscribers, search, filter]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search email…"
          className="min-w-[200px] flex-1 border border-neutral-300 px-3 py-1.5 text-sm focus:border-red-600 focus:outline-none"
        />
        <div className="flex gap-1">
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
        </div>
        <span className="text-xs text-neutral-400">{filtered.length} shown</span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">{subscribers.length === 0 ? 'No subscribers yet.' : 'No results.'}</p>
      ) : (
        <div className="max-h-[420px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-neutral-200 text-neutral-500">
                <th className="py-2 font-medium">Email</th>
                <th className="py-2 font-medium">Subscribed</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-neutral-100">
                  <td className="py-2">{s.email}</td>
                  <td className="py-2 text-neutral-600">{formatDate(s.subscribedAt)}</td>
                  <td className="py-2">
                    <span
                      className={
                        s.isActive
                          ? 'bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'
                          : 'bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600'
                      }
                    >
                      {s.isActive ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
