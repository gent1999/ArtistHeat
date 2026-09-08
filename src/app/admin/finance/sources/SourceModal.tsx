'use client';

import { startTransition, useEffect, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { createFinanceSourceAction, updateFinanceSourceAction } from '@/app/admin/finance-actions';
import { computeFee, round2, type FeeType } from '@/lib/finance-calc';
import { formatMoney } from '@/lib/finance-format';
import type { FinanceSource } from '@/lib/api';

const inputClass = 'w-full border border-neutral-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium';

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

export function SourceModal({
  source,
  triggerLabel = '+ Add Source',
  triggerClassName = 'bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700',
}: {
  source?: FinanceSource | null;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const boundAction = source ? updateFinanceSourceAction.bind(null, source.id) : createFinanceSourceAction;
  const [state, formAction] = useActionState(boundAction, undefined);

  const [defaultGross, setDefaultGross] = useState<number>(source?.defaultGross ?? 0);
  const [feeType, setFeeType] = useState<FeeType>(source?.feeType ?? 'none');
  const [feeValue, setFeeValue] = useState<number>(source?.feeValue ?? 0);

  const previewFee = computeFee(defaultGross, feeType, feeValue);
  const previewNet = round2(defaultGross - previewFee);

  useEffect(() => {
    if (state && !state.error) {
      startTransition(() => setOpen(false));
      router.refresh();
    }
  }, [state, router]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto border border-neutral-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{source ? 'Edit Source' : 'Add Source'}</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-neutral-400 hover:text-red-600">
                Close
              </button>
            </div>

            <form action={formAction} className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>Name</label>
                <input name="name" required defaultValue={source?.name} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <input name="type" defaultValue={source?.type ?? 'manual'} placeholder="manual" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" defaultValue={source?.status ?? 'active'} className={inputClass}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Default Gross</label>
                <input
                  type="number"
                  step="0.01"
                  name="defaultGross"
                  value={defaultGross}
                  onChange={(e) => setDefaultGross(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Fee Type</label>
                  <select name="feeType" value={feeType} onChange={(e) => setFeeType(e.target.value as FeeType)} className={inputClass}>
                    <option value="none">None</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Fee Value</label>
                  <input
                    type="number"
                    step="0.01"
                    name="feeValue"
                    value={feeValue}
                    disabled={feeType === 'none'}
                    onChange={(e) => setFeeValue(Number(e.target.value))}
                    className={`${inputClass} disabled:bg-neutral-100 disabled:text-neutral-400`}
                  />
                </div>
              </div>
              {feeType !== 'none' ? (
                <p className="text-xs text-neutral-500">
                  Preview: an entry at {formatMoney(defaultGross)} gross nets{' '}
                  <span className="font-semibold text-neutral-800">{formatMoney(previewNet)}</span> ({formatMoney(previewFee)} fee).
                </p>
              ) : null}
              <div>
                <label className={labelClass}>Payout Threshold</label>
                <input type="number" step="0.01" name="payoutThreshold" defaultValue={source?.payoutThreshold ?? 0} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Notes</label>
                <textarea name="notes" rows={2} defaultValue={source?.notes ?? ''} className={inputClass} />
              </div>

              {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
              <SubmitButton label={source ? 'Save Changes' : 'Add Source'} />
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
