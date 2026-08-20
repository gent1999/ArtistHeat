import { getSessionToken } from '@/lib/session';
import { api } from '@/lib/api';

function formatPercent(n: number) {
  return `${(n * 100).toFixed(2)}%`;
}

function formatPosition(n: number) {
  return n.toFixed(1);
}

function formatNumber(n: number) {
  return n.toLocaleString('en-US');
}

function PeriodTile({ label, stats }: { label: string; stats: { label: string; value: string | number }[] }) {
  return (
    <div className="border border-neutral-200">
      <div className="border-b border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-bold tracking-wide text-neutral-500 uppercase">
        {label}
      </div>
      <div className="grid grid-cols-2 divide-x divide-neutral-100">
        {stats.map((stat) => (
          <div key={stat.label} className="px-3 py-2">
            <div className="text-[10px] font-medium text-neutral-400 uppercase">{stat.label}</div>
            <div className="text-lg font-bold tabular-nums">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold tracking-wide text-neutral-900 uppercase">
      <span className="h-3 w-1 bg-red-600" />
      {children}
    </h2>
  );
}

export default async function AdminHomePage() {
  const token = (await getSessionToken())!;
  const [{ pagination }, { admin }] = await Promise.all([api.listArticles({ pageSize: 1, page: 1 }, token), api.me(token)]);
  const isAdmin = admin.role === 'admin';

  const overview = isAdmin ? await api.getAnalyticsOverview(token) : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-6 border border-neutral-200 bg-neutral-50 px-4 py-3">
        <div>
          <div className="text-[10px] font-medium text-neutral-400 uppercase">Articles Total</div>
          <div className="text-2xl font-bold tabular-nums">{formatNumber(pagination.total)}</div>
        </div>
      </div>

      {isAdmin && overview ? (
        <>
          <section>
            <SectionHeading>Traffic -- Google Analytics</SectionHeading>
            {overview.analytics ? (
              <>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <PeriodTile
                    label="Last 7 Days"
                    stats={[
                      { label: 'Sessions', value: formatNumber(overview.analytics.last7Days.sessions) },
                      { label: 'Users', value: formatNumber(overview.analytics.last7Days.activeUsers) },
                      { label: 'Pageviews', value: formatNumber(overview.analytics.last7Days.pageviews) },
                    ]}
                  />
                  <PeriodTile
                    label="Last 30 Days"
                    stats={[
                      { label: 'Sessions', value: formatNumber(overview.analytics.last30Days.sessions) },
                      { label: 'Users', value: formatNumber(overview.analytics.last30Days.activeUsers) },
                      { label: 'Pageviews', value: formatNumber(overview.analytics.last30Days.pageviews) },
                    ]}
                  />
                  <PeriodTile
                    label="This Month"
                    stats={[
                      { label: 'Sessions', value: formatNumber(overview.analytics.thisMonth.sessions) },
                      { label: 'Users', value: formatNumber(overview.analytics.thisMonth.activeUsers) },
                      { label: 'Pageviews', value: formatNumber(overview.analytics.thisMonth.pageviews) },
                    ]}
                  />
                  <PeriodTile
                    label="Last Month"
                    stats={[
                      { label: 'Sessions', value: formatNumber(overview.analytics.lastMonth.sessions) },
                      { label: 'Users', value: formatNumber(overview.analytics.lastMonth.activeUsers) },
                      { label: 'Pageviews', value: formatNumber(overview.analytics.lastMonth.pageviews) },
                    ]}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-red-600">{overview.analyticsError || 'Analytics data is unavailable.'}</p>
            )}
          </section>

          <section>
            <SectionHeading>Search -- Google Search Console</SectionHeading>
            {overview.searchConsole ? (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <PeriodTile
                  label="Last 7 Days"
                  stats={[
                    { label: 'Clicks', value: formatNumber(overview.searchConsole.last7Days.clicks) },
                    { label: 'Impressions', value: formatNumber(overview.searchConsole.last7Days.impressions) },
                    { label: 'CTR', value: formatPercent(overview.searchConsole.last7Days.ctr) },
                    { label: 'Avg Pos', value: formatPosition(overview.searchConsole.last7Days.position) },
                  ]}
                />
                <PeriodTile
                  label="Last 28 Days"
                  stats={[
                    { label: 'Clicks', value: formatNumber(overview.searchConsole.last28Days.clicks) },
                    { label: 'Impressions', value: formatNumber(overview.searchConsole.last28Days.impressions) },
                    { label: 'CTR', value: formatPercent(overview.searchConsole.last28Days.ctr) },
                    { label: 'Avg Pos', value: formatPosition(overview.searchConsole.last28Days.position) },
                  ]}
                />
                <PeriodTile
                  label="This Month"
                  stats={[
                    { label: 'Clicks', value: formatNumber(overview.searchConsole.thisMonth.clicks) },
                    { label: 'Impressions', value: formatNumber(overview.searchConsole.thisMonth.impressions) },
                    { label: 'CTR', value: formatPercent(overview.searchConsole.thisMonth.ctr) },
                    { label: 'Avg Pos', value: formatPosition(overview.searchConsole.thisMonth.position) },
                  ]}
                />
                <PeriodTile
                  label="Last Month"
                  stats={[
                    { label: 'Clicks', value: formatNumber(overview.searchConsole.lastMonth.clicks) },
                    { label: 'Impressions', value: formatNumber(overview.searchConsole.lastMonth.impressions) },
                    { label: 'CTR', value: formatPercent(overview.searchConsole.lastMonth.ctr) },
                    { label: 'Avg Pos', value: formatPosition(overview.searchConsole.lastMonth.position) },
                  ]}
                />
              </div>
            ) : (
              <p className="text-sm text-red-600">{overview.searchConsoleError || 'Search Console data is unavailable.'}</p>
            )}
          </section>

          {(overview.analytics?.topPages.length || overview.searchConsole?.topQueries.length) ? (
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {overview.analytics && overview.analytics.topPages.length > 0 ? (
                <div>
                  <SectionHeading>Top Pages (7d)</SectionHeading>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-500">
                        <th className="py-2 font-medium">Path</th>
                        <th className="py-2 text-right font-medium">Pageviews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.analytics.topPages.map((page) => (
                        <tr key={page.path} className="border-b border-neutral-100">
                          <td className="py-2 text-neutral-700">{page.path}</td>
                          <td className="py-2 text-right tabular-nums">{formatNumber(page.pageviews)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {overview.searchConsole && overview.searchConsole.topQueries.length > 0 ? (
                <div>
                  <SectionHeading>Top Queries (28d)</SectionHeading>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-500">
                        <th className="py-2 font-medium">Query</th>
                        <th className="py-2 text-right font-medium">Clicks</th>
                        <th className="py-2 text-right font-medium">Impr.</th>
                        <th className="py-2 text-right font-medium">Pos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.searchConsole.topQueries.map((row) => (
                        <tr key={row.query} className="border-b border-neutral-100">
                          <td className="py-2 text-neutral-700">{row.query}</td>
                          <td className="py-2 text-right tabular-nums">{formatNumber(row.clicks)}</td>
                          <td className="py-2 text-right tabular-nums">{formatNumber(row.impressions)}</td>
                          <td className="py-2 text-right tabular-nums">{formatPosition(row.position)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
