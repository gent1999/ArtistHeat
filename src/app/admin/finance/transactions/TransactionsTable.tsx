'use client';

import { Fragment, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTransactionAction } from '@/app/admin/finance-actions';
import { AddTransactionModal } from '@/components/admin/finance/AddTransactionModal';
import { StatusBadge } from '@/components/admin/finance/FinanceUI';
import { formatMoney, formatSignedMoney, formatShortDate } from '@/lib/finance-format';
import type { FinanceSource, FinanceTransaction } from '@/lib/api';

const KIND_LABELS: Record<string, string> = { income: 'Income', expense: 'Expense', payout: 'Payout' };
const KIND_COLORS: Record<string, string> = { income: 'text-green-600', payout: 'text-green-600', expense: 'text-red-600' };

// One unified ledger table replaces what would otherwise be separate
// Revenue/Expenses/Payouts pages. Income rows expand inline (click) to show
// Gross/Fee/Net/payout status/article URL/notes rather than cluttering the
// primary columns with them. Payout rows only get Delete -- no Edit,
// matching the backend's add-or-delete-only design for payouts.
export function TransactionsTable({ transactions, sources }: { transactions: FinanceTransaction[]; sources: FinanceSource[] }) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete(kind: 'income' | 'expense' | 'payout', id: number, label: string) {
    if (!window.confirm(`Delete "${label}"? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteTransactionAction(kind, id);
      if (result.error) setError(result.error);
      router.refresh();
    });
  }

  if (transactions.length === 0) {
    return <p className="py-10 text-center text-sm text-neutral-400">No transactions match these filters.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500">
              <th className="py-2 font-medium">Date</th>
              <th className="py-2 font-medium">Type</th>
              <th className="py-2 font-medium">Source</th>
              <th className="py-2 font-medium">Description</th>
              <th className="py-2 text-right font-medium">Amount</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const key = `${tx.kind}-${tx.id}`;
              const expanded = expandedKey === key;
              const isIncome = tx.kind === 'income';
              return (
                <Fragment key={key}>
                  <tr
                    className={`border-b border-neutral-100 ${isIncome ? 'cursor-pointer hover:bg-neutral-50' : ''}`}
                    onClick={isIncome ? () => setExpandedKey(expanded ? null : key) : undefined}
                  >
                    <td className="py-2 whitespace-nowrap">{formatShortDate(tx.date)}</td>
                    <td className="py-2">{KIND_LABELS[tx.kind]}</td>
                    <td className="py-2">{tx.source_name ?? '--'}</td>
                    <td className="max-w-[220px] truncate py-2">{tx.description}</td>
                    <td className={`py-2 text-right font-bold tabular-nums ${KIND_COLORS[tx.kind]}`}>{formatSignedMoney(tx.amount)}</td>
                    <td className="py-2">{tx.payment_status ? <StatusBadge status={tx.payment_status} /> : '--'}</td>
                    <td className="py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-3">
                        {tx.kind !== 'payout' ? (
                          <AddTransactionModal
                            sources={sources}
                            editing={tx}
                            triggerLabel="Edit"
                            triggerClassName="text-xs font-semibold text-neutral-500 hover:text-red-600"
                          />
                        ) : null}
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(tx.kind, tx.id, tx.description)}
                          className="text-xs font-semibold text-neutral-500 hover:text-red-600 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded ? (
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <td colSpan={7} className="px-2 py-4">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs sm:grid-cols-4">
                          <div>
                            <p className="text-neutral-400 uppercase">Gross</p>
                            <p className="font-semibold">{formatMoney(tx.gross_amount ?? 0)}</p>
                          </div>
                          <div>
                            <p className="text-neutral-400 uppercase">Fee</p>
                            <p className="font-semibold">{formatMoney(tx.fee_amount ?? 0)}</p>
                          </div>
                          <div>
                            <p className="text-neutral-400 uppercase">Net</p>
                            <p className="font-semibold">{formatMoney(tx.net_amount ?? 0)}</p>
                          </div>
                          <div>
                            <p className="text-neutral-400 uppercase">Payout Status</p>
                            {tx.payout_status ? <StatusBadge status={tx.payout_status} /> : <p className="font-semibold">--</p>}
                          </div>
                          {tx.article_url ? (
                            <div className="col-span-2 sm:col-span-4">
                              <p className="text-neutral-400 uppercase">Article URL</p>
                              <a
                                href={tx.article_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold break-all text-red-600 hover:underline"
                              >
                                {tx.article_url}
                              </a>
                            </div>
                          ) : null}
                          {tx.notes ? (
                            <div className="col-span-2 sm:col-span-4">
                              <p className="text-neutral-400 uppercase">Notes</p>
                              <p className="whitespace-pre-wrap text-neutral-700">{tx.notes}</p>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
