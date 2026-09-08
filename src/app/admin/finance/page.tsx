import Link from 'next/link';
import { getSessionToken } from '@/lib/session';
import { api } from '@/lib/api';
import { FinancePageHeader, Panel, KpiCard, ProgressBar } from '@/components/admin/finance/FinanceUI';
import { AddTransactionModal } from '@/components/admin/finance/AddTransactionModal';
import { MonthlyFinanceChart } from '@/components/admin/finance/MonthlyFinanceChart';
import { MonthlyRangeSelect } from '@/components/admin/finance/MonthlyRangeSelect';
import { formatMoney, formatSignedMoney, formatShortDate } from '@/lib/finance-format';

type Props = { searchParams: Promise<{ range?: string }> };

const KIND_STYLES: Record<string, string> = {
  income: 'text-green-600',
  payout: 'text-green-600',
  expense: 'text-red-600',
};

export default async function FinanceOverviewPage({ searchParams }: Props) {
  const token = (await getSessionToken())!;
  const { range: rangeParam } = await searchParams;
  const range = rangeParam || 'last12';

  const [summary, trendData, { sources }, { transactions: recentActivity }] = await Promise.all([
    api.getFinanceSummary(token),
    api.getFinanceMonthlyTrend(range, token),
    api.listFinanceSources(token),
    api.listFinanceTransactions({ limit: 5 }, token),
  ]);

  const rankedSources = [...sources].filter((s) => s.lifetime_net > 0).sort((a, b) => b.lifetime_net - a.lifetime_net);
  const totalRanked = rankedSources.reduce((sum, s) => sum + s.lifetime_net, 0);

  const balances = summary.payoutProgressBySource.filter((p) => p.pendingBalance > 0);

  return (
    <div className="flex flex-col gap-6">
      <FinancePageHeader title="Finance" actions={<AddTransactionModal sources={sources} />} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Lifetime Profit" value={formatMoney(summary.lifetimeProfit)} primary />
        <KpiCard label="Gross Income" value={formatMoney(summary.totalGrossRevenue)} />
        <KpiCard label="Net Revenue" value={formatMoney(summary.totalNetRevenue)} />
        <KpiCard label="Expenses" value={formatMoney(summary.totalExpenses)} />
        <KpiCard
          label="This Month"
          value={formatSignedMoney(summary.currentMonthProfit)}
          valueClassName={summary.currentMonthProfit < 0 ? 'text-red-600' : 'text-green-600'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Panel
            title="Monthly Overview"
            right={<MonthlyRangeSelect range={trendData.range} availableYears={trendData.availableYears} />}
          >
            <MonthlyFinanceChart data={trendData.trend} />
          </Panel>

          <Panel title="Revenue by Source">
            {rankedSources.length === 0 ? (
              <p className="text-sm text-neutral-400">No revenue recorded yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {rankedSources.map((source) => {
                  const share = totalRanked > 0 ? Math.round((source.lifetime_net / totalRanked) * 100) : 0;
                  return (
                    <div key={source.id}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-neutral-800">{source.name}</span>
                        <span className="tabular-nums text-neutral-500">
                          {formatMoney(source.lifetime_net)} <span className="text-neutral-400">({share}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-100">
                        <div className="h-1.5 bg-red-600" style={{ width: `${share}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel title="Recent Activity" right={<Link href="/admin/finance/transactions" className="text-xs font-bold text-red-600 hover:underline">View All &rarr;</Link>}>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-neutral-400">No transactions yet.</p>
            ) : (
              <div className="flex flex-col divide-y divide-neutral-100">
                {recentActivity.map((tx) => (
                  <div key={`${tx.kind}-${tx.id}`} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-neutral-800">{tx.description}</p>
                      <p className="text-xs text-neutral-500">
                        {tx.source_name ? `${tx.source_name} · ` : ''}
                        {formatShortDate(tx.date)}
                      </p>
                    </div>
                    <span className={`shrink-0 font-bold tabular-nums ${KIND_STYLES[tx.kind]}`}>{formatSignedMoney(tx.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Balances">
            {balances.length === 0 ? (
              <p className="text-sm text-neutral-400">No pending balances.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {balances.map((b) => (
                  <div key={b.sourceId}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-neutral-800">{b.sourceName}</span>
                      <span className="tabular-nums text-neutral-500">{formatMoney(b.pendingBalance)}</span>
                    </div>
                    <ProgressBar progress={b.progress} ready={b.ready} />
                    <p className={`mt-1 text-xs font-semibold ${b.ready ? 'text-green-600' : 'text-neutral-500'}`}>
                      {b.ready ? 'Ready to cash out' : `${formatMoney(b.remaining)} to payout`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Upcoming Costs">
            {summary.upcomingRenewals.length === 0 ? (
              <p className="text-sm text-neutral-400">No upcoming costs.</p>
            ) : (
              <div className="flex flex-col divide-y divide-neutral-100">
                {summary.upcomingRenewals.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                    <div className="flex items-center gap-2">
                      {r.daysUntil <= 14 ? <span className="h-1.5 w-1.5 shrink-0 bg-red-600" /> : null}
                      <div>
                        <p className="font-medium text-neutral-800">{r.name}</p>
                        <p className="text-xs text-neutral-500">
                          {r.daysUntil === 0 ? 'Renews today' : `Renews in ${r.daysUntil} day${r.daysUntil === 1 ? '' : 's'}`}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-bold tabular-nums text-neutral-700">{formatMoney(r.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
