import { getSessionToken } from '@/lib/session';
import { api } from '@/lib/api';
import { FinancePageHeader, StatusBadge } from '@/components/admin/finance/FinanceUI';
import { SourceModal } from './SourceModal';
import { DeleteSourceButton } from './DeleteSourceButton';
import { formatMoney } from '@/lib/finance-format';
import type { FinanceSource } from '@/lib/api';

function feeSummary(source: FinanceSource): string | null {
  if (source.feeType === 'none') return null;
  if (source.feeType === 'percentage') return `${source.feeValue}% fee`;
  return `${formatMoney(source.feeValue)} flat fee`;
}

// Deliberately no permanent Gross | Fee | Net breakdown here -- that detail
// only belongs in the Edit modal's live preview. Up to 3 lines: what it's
// earned, its fee structure, and what's waiting for payout -- each only
// shown when it's actually true, so a fresh/quiet source doesn't show a
// wall of zeros.
function SourceCard({ source }: { source: FinanceSource }) {
  const earned = source.lifetime_net > 0 ? `${formatMoney(source.lifetime_net)} earned` : null;
  const fee = feeSummary(source);
  const waiting = source.current_balance > 0 ? `${formatMoney(source.current_balance)} waiting for payout` : null;
  const lines = [earned, fee].filter((line): line is string => Boolean(line));
  const isQuiet = lines.length === 0 && !waiting;
  const showPendingFallback = isQuiet && source.status === 'pending' && source.entry_count === 0;

  return (
    <div className="flex flex-col gap-3 border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-neutral-900">{source.name}</h3>
        <StatusBadge status={source.status} />
      </div>

      <div className="flex flex-col gap-1 text-sm text-neutral-600">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {waiting ? <p className="font-semibold text-red-600">{waiting}</p> : null}
        {showPendingFallback ? <p className="text-neutral-400">{source.notes || 'Waiting for approval'}</p> : null}
        {isQuiet && !showPendingFallback ? <p className="text-neutral-400">No activity yet</p> : null}
      </div>

      <div className="mt-1 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500">
        <span>
          {source.entry_count} {source.entry_count === 1 ? 'entry' : 'entries'}
        </span>
        <div className="flex items-center gap-3">
          <SourceModal source={source} triggerLabel="Edit" triggerClassName="font-semibold text-neutral-500 hover:text-red-600" />
          <DeleteSourceButton sourceId={source.id} name={source.name} />
        </div>
      </div>
    </div>
  );
}

export default async function FinanceSourcesPage() {
  const token = (await getSessionToken())!;
  const { sources } = await api.listFinanceSources(token);

  return (
    <div className="flex flex-col gap-6">
      <FinancePageHeader title="Sources" actions={<SourceModal />} />
      {sources.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-400">No revenue sources yet. Add your first one to start tracking income.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      )}
    </div>
  );
}
