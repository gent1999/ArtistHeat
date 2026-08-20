import { getSessionToken } from '@/lib/session';
import { api } from '@/lib/api';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-neutral-200 p-4">
      <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function formatPercent(n: number) {
  return `${(n * 100).toFixed(2)}%`;
}

function formatPosition(n: number) {
  return n.toFixed(1);
}

export default async function AdminHomePage() {
  const token = (await getSessionToken())!;
  const [{ pagination }, { admin }] = await Promise.all([api.listArticles({ pageSize: 1, page: 1 }, token), api.me(token)]);
  const isAdmin = admin.role === 'admin';

  const overview = isAdmin ? await api.getAnalyticsOverview(token) : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
        <p className="text-neutral-600">{pagination.total} articles total.</p>
      </div>

      {isAdmin && overview ? (
        <>
          <section>
            <h2 className="mb-3 text-lg font-bold">Traffic (Google Analytics)</h2>
            {overview.analytics ? (
              <>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                  <div>
                    <p className="mb-2 text-xs font-semibold text-neutral-500 uppercase">Last 7 Days</p>
                    <div className="grid grid-cols-3 gap-2">
                      <StatCard label="Sessions" value={overview.analytics.last7Days.sessions} />
                      <StatCard label="Users" value={overview.analytics.last7Days.activeUsers} />
                      <StatCard label="Pageviews" value={overview.analytics.last7Days.pageviews} />
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold text-neutral-500 uppercase">Last 30 Days</p>
                    <div className="grid grid-cols-3 gap-2">
                      <StatCard label="Sessions" value={overview.analytics.last30Days.sessions} />
                      <StatCard label="Users" value={overview.analytics.last30Days.activeUsers} />
                      <StatCard label="Pageviews" value={overview.analytics.last30Days.pageviews} />
                    </div>
                  </div>
                </div>

                {overview.analytics.topPages.length > 0 ? (
                  <table className="mt-4 w-full max-w-xl text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-500">
                        <th className="py-2 font-medium">Top Pages (7d)</th>
                        <th className="py-2 text-right font-medium">Pageviews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.analytics.topPages.map((page) => (
                        <tr key={page.path} className="border-b border-neutral-100">
                          <td className="py-2 text-neutral-700">{page.path}</td>
                          <td className="py-2 text-right">{page.pageviews}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-red-600">{overview.analyticsError || 'Analytics data is unavailable.'}</p>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">Search (Google Search Console)</h2>
            {overview.searchConsole ? (
              <>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                  <div>
                    <p className="mb-2 text-xs font-semibold text-neutral-500 uppercase">Last 7 Days</p>
                    <div className="grid grid-cols-2 gap-2">
                      <StatCard label="Clicks" value={overview.searchConsole.last7Days.clicks} />
                      <StatCard label="Impressions" value={overview.searchConsole.last7Days.impressions} />
                      <StatCard label="CTR" value={formatPercent(overview.searchConsole.last7Days.ctr)} />
                      <StatCard label="Avg Position" value={formatPosition(overview.searchConsole.last7Days.position)} />
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold text-neutral-500 uppercase">Last 28 Days</p>
                    <div className="grid grid-cols-2 gap-2">
                      <StatCard label="Clicks" value={overview.searchConsole.last28Days.clicks} />
                      <StatCard label="Impressions" value={overview.searchConsole.last28Days.impressions} />
                      <StatCard label="CTR" value={formatPercent(overview.searchConsole.last28Days.ctr)} />
                      <StatCard label="Avg Position" value={formatPosition(overview.searchConsole.last28Days.position)} />
                    </div>
                  </div>
                </div>

                {overview.searchConsole.topQueries.length > 0 ? (
                  <table className="mt-4 w-full max-w-2xl text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-500">
                        <th className="py-2 font-medium">Top Queries (28d)</th>
                        <th className="py-2 text-right font-medium">Clicks</th>
                        <th className="py-2 text-right font-medium">Impressions</th>
                        <th className="py-2 text-right font-medium">Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.searchConsole.topQueries.map((row) => (
                        <tr key={row.query} className="border-b border-neutral-100">
                          <td className="py-2 text-neutral-700">{row.query}</td>
                          <td className="py-2 text-right">{row.clicks}</td>
                          <td className="py-2 text-right">{row.impressions}</td>
                          <td className="py-2 text-right">{formatPosition(row.position)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-red-600">{overview.searchConsoleError || 'Search Console data is unavailable.'}</p>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
