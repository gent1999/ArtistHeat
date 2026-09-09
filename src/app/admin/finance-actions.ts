'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ApiError, api } from '@/lib/api';
import { getSessionToken } from '@/lib/session';
import type {
  FeeType,
  SourceStatus,
  RevenuePaymentStatus,
  FinancePayoutStatus,
  ExpenseCategory,
  BillingCycle,
  ExpensePaymentStatus,
} from '@/lib/api';

async function requireToken() {
  const token = await getSessionToken();
  if (!token) redirect('/admin/login');
  return token;
}

function revalidateFinance() {
  revalidatePath('/admin/finance');
  revalidatePath('/admin/finance/transactions');
  revalidatePath('/admin/finance/sources');
}

function numberOrUndefined(v: FormDataEntryValue | null): number | undefined {
  const s = String(v ?? '').trim();
  return s ? Number(s) : undefined;
}

// -- Sources ----------------------------------------------------------------

export async function createFinanceSourceAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const token = await requireToken();
  try {
    await api.createFinanceSource(
      {
        name: String(formData.get('name') || '').trim(),
        type: String(formData.get('type') || 'manual').trim() || 'manual',
        defaultGross: numberOrUndefined(formData.get('defaultGross')) ?? 0,
        feeType: (String(formData.get('feeType') || 'none') as FeeType) || 'none',
        feeValue: numberOrUndefined(formData.get('feeValue')) ?? 0,
        payoutThreshold: numberOrUndefined(formData.get('payoutThreshold')) ?? 0,
        status: (String(formData.get('status') || 'active') as SourceStatus) || 'active',
        notes: String(formData.get('notes') || '').trim() || null,
      },
      token
    );
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong creating the source. Try again.' };
  }
  revalidateFinance();
  return {};
}

export async function updateFinanceSourceAction(
  sourceId: number,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const token = await requireToken();
  try {
    await api.updateFinanceSource(
      sourceId,
      {
        name: String(formData.get('name') || '').trim(),
        type: String(formData.get('type') || 'manual').trim() || 'manual',
        defaultGross: numberOrUndefined(formData.get('defaultGross')) ?? 0,
        feeType: (String(formData.get('feeType') || 'none') as FeeType) || 'none',
        feeValue: numberOrUndefined(formData.get('feeValue')) ?? 0,
        payoutThreshold: numberOrUndefined(formData.get('payoutThreshold')) ?? 0,
        status: (String(formData.get('status') || 'active') as SourceStatus) || 'active',
        notes: String(formData.get('notes') || '').trim() || null,
      },
      token
    );
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong saving the source. Try again.' };
  }
  revalidateFinance();
  return {};
}

export async function deleteFinanceSourceAction(sourceId: number): Promise<{ error?: string }> {
  const token = await requireToken();
  try {
    await api.deleteFinanceSource(sourceId, token);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong deleting the source.' };
  }
  revalidateFinance();
  return {};
}

// -- Unified Add/Edit Transaction modal --------------------------------------
// One form, three underlying endpoints -- the modal is a UI convenience
// over entries/expenses/payouts, not a fourth unified table.

export async function saveTransactionAction(
  editing: { kind: 'income' | 'expense' | 'payout'; id: number } | null,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const token = await requireToken();
  const type = String(formData.get('type') || 'income');

  try {
    if (type === 'income') {
      const grossAmount = numberOrUndefined(formData.get('grossAmount')) ?? 0;
      const feeAmount = numberOrUndefined(formData.get('feeAmount')) ?? 0;
      const netAmount = numberOrUndefined(formData.get('netAmount'));
      const sourceIdRaw = String(formData.get('sourceId') || '');
      const payload = {
        date: String(formData.get('date') || '').trim() || undefined,
        sourceId: sourceIdRaw ? Number(sourceIdRaw) : null,
        articleTitle: String(formData.get('articleTitle') || '').trim() || null,
        articleUrl: String(formData.get('articleUrl') || '').trim() || null,
        clientName: String(formData.get('clientName') || '').trim() || null,
        grossAmount,
        feeAmount,
        netAmount,
        paymentStatus: (String(formData.get('paymentStatus') || 'pending') as RevenuePaymentStatus) || 'pending',
        payoutStatus: (String(formData.get('payoutStatus') || 'not_ready') as FinancePayoutStatus) || 'not_ready',
        notes: String(formData.get('notes') || '').trim() || null,
      };
      if (editing && editing.kind === 'income') {
        await api.updateFinanceEntry(editing.id, payload, token);
      } else {
        await api.createFinanceEntry(payload, token);
      }
    } else if (type === 'expense') {
      const payload = {
        name: String(formData.get('name') || '').trim(),
        vendor: String(formData.get('vendor') || '').trim() || null,
        category: (String(formData.get('category') || 'other') as ExpenseCategory) || 'other',
        billingCycle: (String(formData.get('billingCycle') || 'one_time') as BillingCycle) || 'one_time',
        amount: numberOrUndefined(formData.get('amount')) ?? 0,
        paymentStatus: (String(formData.get('expensePaymentStatus') || 'paid') as ExpensePaymentStatus) || 'paid',
        renewalDate: String(formData.get('renewalDate') || '').trim() || null,
        notes: String(formData.get('notes') || '').trim() || null,
        date: String(formData.get('date') || '').trim() || undefined,
      };
      if (editing && editing.kind === 'expense') {
        await api.updateFinanceExpense(editing.id, payload, token);
      } else {
        await api.createFinanceExpense(payload, token);
      }
    } else if (type === 'payout') {
      // Payouts are add-or-delete only -- `editing` is never a payout here
      // since the Transactions table only offers Delete on payout rows.
      const sourceIdRaw = String(formData.get('payoutSourceId') || '');
      await api.createFinancePayout(
        {
          sourceId: sourceIdRaw ? Number(sourceIdRaw) : null,
          amount: numberOrUndefined(formData.get('payoutAmount')) ?? 0,
          date: String(formData.get('payoutDate') || '').trim() || undefined,
          notes: String(formData.get('notes') || '').trim() || null,
          markEntriesPaid: formData.get('markEntriesPaid') === 'on',
        },
        token
      );
    }
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong saving the transaction. Try again.' };
  }

  revalidateFinance();
  return {};
}

export async function deleteTransactionAction(
  kind: 'income' | 'expense' | 'payout',
  id: number
): Promise<{ error?: string }> {
  const token = await requireToken();
  try {
    if (kind === 'income') await api.deleteFinanceEntry(id, token);
    else if (kind === 'expense') await api.deleteFinanceExpense(id, token);
    else await api.deleteFinancePayout(id, token);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong deleting that. Try again.' };
  }
  revalidateFinance();
  return {};
}
