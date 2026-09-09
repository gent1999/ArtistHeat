'use client';

import { startTransition, useEffect, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { saveTransactionAction } from '@/app/admin/finance-actions';
import { computeFee, round2 } from '@/lib/finance-calc';
import type { FinanceSource, FinanceTransaction } from '@/lib/api';

const inputClass = 'w-full border border-neutral-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium';

type TransactionType = 'income' | 'expense' | 'payout';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
    >
      {pending ? 'Saving…' : label}
    </button>
  );
}

// One modal, three modes -- a UI convenience over three real endpoints
// (entries/expenses/payouts), not a fourth unified table. Used both as the
// page-level "+ Add Transaction" trigger (editing=null) and as each
// Transactions-table row's Edit trigger (editing=that row).
export function AddTransactionModal({
  sources,
  editing,
  triggerLabel = '+ Add Transaction',
  triggerClassName = 'bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700',
}: {
  sources: FinanceSource[];
  editing?: FinanceTransaction | null;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const editingRef = editing ? { kind: editing.kind, id: editing.id } : null;
  const boundAction = saveTransactionAction.bind(null, editingRef);
  const [state, formAction] = useActionState(boundAction, undefined);

  const [type, setType] = useState<TransactionType>(editing?.kind ?? 'income');
  const [sourceId, setSourceId] = useState<string>(editing?.source_id != null ? String(editing.source_id) : '');
  const [gross, setGross] = useState<number>(editing?.gross_amount ?? 0);
  const [fee, setFee] = useState<number>(editing?.fee_amount ?? 0);
  const [net, setNet] = useState<number>(editing?.net_amount ?? 0);

  useEffect(() => {
    if (state && !state.error) {
      startTransition(() => setOpen(false));
      router.refresh();
    }
  }, [state, router]);

  function handleSourceChange(id: string) {
    setSourceId(id);
    const source = sources.find((s) => String(s.id) === id);
    if (source) {
      const g = source.defaultGross;
      const f = computeFee(g, source.feeType, source.feeValue);
      setGross(g);
      setFee(f);
      setNet(round2(g - f));
    }
  }

  function handleGrossChange(value: number) {
    setGross(value);
    setNet(round2(value - fee));
  }

  function handleFeeChange(value: number) {
    setFee(value);
    setNet(round2(gross - value));
  }

  const isoDate = (d: string | null | undefined) => (d ? d.slice(0, 10) : '');

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto border border-neutral-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-neutral-400 hover:text-red-600">
                Close
              </button>
            </div>

            <div className="mb-4 flex gap-2">
              {(['income', 'expense', 'payout'] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={Boolean(editing)}
                  onClick={() => setType(t)}
                  className={`flex-1 border px-3 py-2 text-xs font-bold tracking-wide uppercase disabled:cursor-not-allowed disabled:opacity-50 ${
                    type === t ? 'border-red-600 bg-red-600 text-white' : 'border-neutral-300 text-neutral-600 hover:border-red-600 hover:text-red-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <form action={formAction} className="flex flex-col gap-4">
              <input type="hidden" name="type" value={type} />

              {type === 'income' ? (
                <>
                  <div>
                    <label className={labelClass}>Date</label>
                    <input type="date" name="date" defaultValue={isoDate(editing?.date) || new Date().toISOString().slice(0, 10)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Source</label>
                    <select name="sourceId" value={sourceId} onChange={(e) => handleSourceChange(e.target.value)} className={inputClass}>
                      <option value="">No source</option>
                      {sources.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Article Title</label>
                    <input name="articleTitle" defaultValue={editing?.article_title ?? ''} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Client Name</label>
                    <input name="clientName" defaultValue={editing?.client_name ?? ''} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Article URL</label>
                    <input type="url" name="articleUrl" defaultValue={editing?.article_url ?? ''} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Gross</label>
                      <input
                        type="number"
                        step="0.01"
                        name="grossAmount"
                        value={gross}
                        onChange={(e) => handleGrossChange(Number(e.target.value))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Fee</label>
                      <input
                        type="number"
                        step="0.01"
                        name="feeAmount"
                        value={fee}
                        onChange={(e) => handleFeeChange(Number(e.target.value))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Net</label>
                      <input
                        type="number"
                        step="0.01"
                        name="netAmount"
                        value={net}
                        onChange={(e) => setNet(Number(e.target.value))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Payment Status</label>
                      <select name="paymentStatus" defaultValue={editing?.payment_status ?? 'pending'} className={inputClass}>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Payout Status</label>
                      <select name="payoutStatus" defaultValue={editing?.payout_status ?? 'not_ready'} className={inputClass}>
                        <option value="not_ready">Not Ready</option>
                        <option value="ready_for_payout">Ready for Payout</option>
                        <option value="paid_out">Paid Out</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : null}

              {type === 'expense' ? (
                <>
                  <div>
                    <label className={labelClass}>Name</label>
                    <input name="name" defaultValue={editing?.description ?? ''} required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Date</label>
                    <input
                      type="date"
                      name="date"
                      defaultValue={isoDate(editing?.date) || new Date().toISOString().slice(0, 10)}
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs text-neutral-500">When this expense was actually incurred -- not just today.</p>
                  </div>
                  <div>
                    <label className={labelClass}>Vendor</label>
                    <input name="vendor" defaultValue={editing?.vendor ?? ''} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Category</label>
                      <select name="category" defaultValue={editing?.category ?? 'other'} className={inputClass}>
                        <option value="domain">Domain</option>
                        <option value="hosting">Hosting</option>
                        <option value="software">Software</option>
                        <option value="ads">Ads</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Billing Cycle</label>
                      <select name="billingCycle" defaultValue={editing?.billing_cycle ?? 'one_time'} className={inputClass}>
                        <option value="one_time">One Time</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      name="amount"
                      defaultValue={editing ? Math.abs(editing.amount) : undefined}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Payment Status</label>
                    <select name="expensePaymentStatus" defaultValue={editing?.payment_status ?? 'paid'} className={inputClass}>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Renewal Date (optional)</label>
                    <input type="date" name="renewalDate" defaultValue={isoDate(editing?.renewal_date)} className={inputClass} />
                  </div>
                </>
              ) : null}

              {type === 'payout' ? (
                <>
                  <div>
                    <label className={labelClass}>Source</label>
                    <select name="payoutSourceId" defaultValue={editing?.source_id ?? ''} className={inputClass}>
                      <option value="">No source</option>
                      {sources.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Amount</label>
                    <input type="number" step="0.01" name="payoutAmount" defaultValue={editing?.amount} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Date</label>
                    <input
                      type="date"
                      name="payoutDate"
                      defaultValue={isoDate(editing?.date) || new Date().toISOString().slice(0, 10)}
                      className={inputClass}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="markEntriesPaid" />
                    Mark this source&rsquo;s pending revenue entries as paid out
                  </label>
                </>
              ) : null}

              <div>
                <label className={labelClass}>Notes</label>
                <textarea name="notes" rows={2} defaultValue={editing?.notes ?? ''} className={inputClass} />
              </div>

              {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
              <SubmitButton label={editing ? 'Save Changes' : 'Add Transaction'} />
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
