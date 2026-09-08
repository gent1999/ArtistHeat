import Link from 'next/link';
import { getSessionToken } from '@/lib/session';
import { api } from '@/lib/api';
import { FinancePageHeader, Panel } from '@/components/admin/finance/FinanceUI';
import { AddTransactionModal } from '@/components/admin/finance/AddTransactionModal';
import { TransactionsTable } from './TransactionsTable';

type Props = {
  searchParams: Promise<{ type?: string; source_id?: string; from?: string; to?: string; payment_status?: string }>;
};

const TABS: { value?: string; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expenses' },
  { value: 'payout', label: 'Payouts' },
];

export default async function FinanceTransactionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentType = params.type || undefined;
  const token = (await getSessionToken())!;

  const [{ transactions }, { sources }] = await Promise.all([
    api.listFinanceTransactions(
      {
        type: currentType,
        source_id: params.source_id ? Number(params.source_id) : undefined,
        from: params.from,
        to: params.to,
        payment_status: params.payment_status,
      },
      token
    ),
    api.listFinanceSources(token),
  ]);

  const tabHref = (value?: string) => (value ? `/admin/finance/transactions?type=${value}` : '/admin/finance/transactions');

  return (
    <div className="flex flex-col gap-6">
      <FinancePageHeader title="Transactions" actions={<AddTransactionModal sources={sources} />} />

      <div className="flex gap-1 border-b border-neutral-200">
        {TABS.map((tab) => (
          <Link
            key={tab.label}
            href={tabHref(tab.value)}
            className={`border-b-2 px-4 py-2 text-sm font-semibold ${
              currentType === tab.value ? 'border-red-600 text-red-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <details className="border border-neutral-300 bg-white p-3">
        <summary className="cursor-pointer text-sm font-medium">Filters</summary>
        <form method="GET" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <input type="hidden" name="type" value={currentType ?? ''} />
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">Source</label>
            <select name="source_id" defaultValue={params.source_id ?? ''} className="w-full border border-neutral-300 px-2 py-1.5 text-sm">
              <option value="">All Sources</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">From</label>
            <input type="date" name="from" defaultValue={params.from ?? ''} className="w-full border border-neutral-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">To</label>
            <input type="date" name="to" defaultValue={params.to ?? ''} className="w-full border border-neutral-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">Payment Status</label>
            <select
              name="payment_status"
              defaultValue={params.payment_status ?? ''}
              className="w-full border border-neutral-300 px-2 py-1.5 text-sm"
            >
              <option value="">Any</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center gap-3 sm:col-span-4">
            <button type="submit" className="bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700">
              Apply Filters
            </button>
            <Link href={tabHref(currentType)} className="text-xs font-semibold text-neutral-500 hover:text-red-600">
              Clear
            </Link>
          </div>
        </form>
      </details>

      <Panel>
        <TransactionsTable transactions={transactions} sources={sources} />
      </Panel>
    </div>
  );
}
