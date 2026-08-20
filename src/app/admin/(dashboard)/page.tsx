import Link from 'next/link';
import { getSessionToken } from '@/lib/session';
import { api } from '@/lib/api';
import { TrafficChart } from './TrafficChart';

function formatPercent(n: number) {
  return `${(n * 100).toFixed(2)}%`;
}

function formatPosition(n: number) {
  return n.toFixed(1);
}

function formatNumber(n: number) {
  return n.toLocaleString('en-US');
}

function formatChange(current: number, previous: number): { label: string; positive: boolean } | null {
  if (previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  return { label: `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`, positive: pct >= 0 };
}

function StatCard({ label, value, badge }: { label: string; value: string | number; badge?: { label: string; positive: boolean } }) {
  return (
    <div className="border border-neutral-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-medium text-neutral-400 uppercase">{label}</div>
        {badge ? (
          <span className={`text-[10px] font-bold ${badge.positive ? 'text-green-600' : 'text-red-600'}`}>{badge.label}</span>
        ) : null}
      </div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function PeriodTile({ label, stats }: { label: string; stats: { label: string; value: string | number }[] }) {
  return (
    <div className="border border-neutral-200 bg-white">
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

function SectionHeading({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-wide text-neutral-900 uppercase">
        <span className="h-3 w-1 bg-red-600" />
        {children}
      </h2>
      {right}
    </div>
  );
}

export default async function AdminHomePage() {
  const token = (await getSessionToken())!;
  const [{ pagination: totalPagination }, { pagination: publishedPagination }, { pagination: featuredPagination }, { admin }] =
    await Promise.all([
      api.listArticles({ pageSize: 1 }, token),
      api.listArticles({ pageSize: 1, status: 'published' }, token),
      api.listArticles({ pageSize: 1, isFeatured: true }, token),
      api.me(token),
    ]);
  const isAdmin = admin.role === 'admin';

  const [overview, { articles: recentArticles }] = await Promise.all([
    isAdmin ? api.getAnalyticsOverview(token) : Promise.resolve(null),
    api.listArticles({ pageSize: 5 }, token),
  ]);

  const monthlyTrend = overview?.analytics?.monthlyTrend ?? [];
  const trendSum = monthlyTrend.reduce((sum, m) => sum + m.sessions, 0);
  const trendAvg = monthlyTrend.length > 0 ? Math.round(trendSum / monthlyTrend.length) : 0;
  const thisMonthChange = overview?.analytics
    ? formatChange(overview.analytics.thisMonth.sessions, overview.analytics.lastMonth.sessions)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <StatCard label="Articles" value={formatNumber(totalPagination.total)} />
        <StatCard label="Published" value={formatNumber(publishedPagination.total)} />
        <StatCard label="Featured" value={formatNumber(featuredPagination.total)} />
        {overview?.analytics ? (
          <>
            <StatCard
              label="This Month"
              value={formatNumber(overview.analytics.thisMonth.sessions)}
              badge={thisMonthChange ?? undefined}
            />
            <StatCard label="Last Month" value={formatNumber(overview.analytics.lastMonth.sessions)} />
            <StatCard label="12-Month Total" value={formatNumber(trendSum)} />
            <StatCard label="Avg Monthly" value={formatNumber(trendAvg)} />
          </>
        ) : null}
      </div>

      {isAdmin && overview ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
          <section className="border border-neutral-200 bg-white p-4">
            <SectionHeading right={thisMonthChange ? <span className="text-xs font-bold text-neutral-500">{thisMonthChange.label} vs previous</span> : null}>
              Traffic Overview
            </SectionHeading>
            {overview.analytics ? (
              <>
                <div className="mb-4 grid grid-cols-3 gap-3">
                  <PeriodTile
                    label="Last Month"
                    stats={[{ label: 'Sessions', value: formatNumber(overview.analytics.lastMonth.sessions) }]}
                  />
                  <PeriodTile label="Average" stats={[{ label: 'Sessions', value: formatNumber(trendAvg) }]} />
                  <PeriodTile
                    label="This Month"
                    stats={[{ label: 'Sessions', value: formatNumber(overview.analytics.thisMonth.sessions) }]}
                  />
                </div>
                {monthlyTrend.length > 0 ? <TrafficChart data={monthlyTrend} /> : null}
              </>
            ) : (
              <p className="text-sm text-red-600">{overview.analyticsError || 'Analytics data is unavailable.'}</p>
            )}
          </section>

          <section className="border border-neutral-200 bg-white p-4">
            <SectionHeading>Search Console</SectionHeading>
            {overview.searchConsole ? (
              <>
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <StatCard label="Clicks (28d)" value={formatNumber(overview.searchConsole.last28Days.clicks)} />
                  <StatCard label="Impressions" value={formatNumber(overview.searchConsole.last28Days.impressions)} />
                  <StatCard label="CTR" value={formatPercent(overview.searchConsole.last28Days.ctr)} />
                  <StatCard label="Avg Position" value={formatPosition(overview.searchConsole.last28Days.position)} />
                </div>

                <p className="mb-1 text-xs font-bold text-neutral-500 uppercase">Top Keywords</p>
                <table className="mb-4 w-full text-left text-xs">
                  <tbody>
                    {overview.searchConsole.topQueries.length > 0 ? (
                      overview.searchConsole.topQueries.map((row) => (
                        <tr key={row.query} className="border-b border-neutral-100">
                          <td className="py-1.5 text-neutral-700">{row.query}</td>
                          <td className="py-1.5 text-right tabular-nums text-neutral-500">{row.clicks}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-1.5 text-neutral-400">No Search Console data yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <p className="mb-1 text-xs font-bold text-neutral-500 uppercase">Top Pages</p>
                <table className="w-full text-left text-xs">
                  <tbody>
                    {overview.searchConsole.topPages.length > 0 ? (
                      overview.searchConsole.topPages.map((row) => (
                        <tr key={row.page} className="border-b border-neutral-100">
                          <td className="truncate py-1.5 text-neutral-700">{row.page.replace(/^https?:\/\/[^/]+/, '')}</td>
                          <td className="py-1.5 text-right tabular-nums text-neutral-500">{row.clicks}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-1.5 text-neutral-400">No Search Console data yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="text-sm text-red-600">{overview.searchConsoleError || 'Search Console data is unavailable.'}</p>
            )}
          </section>
        </div>
      ) : null}

      {isAdmin && overview ? (
        <section className="border border-neutral-200 bg-white p-4">
          <SectionHeading
            right={
              overview.seoStats ? (
                <span className="text-xs font-medium text-neutral-400">
                  {overview.seoStats.stale ? 'Stale -- ' : ''}
                  Updated {new Date(overview.seoStats.fetchedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              ) : null
            }
          >
            Domain Authority -- Moz
          </SectionHeading>
          {overview.seoStats ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <StatCard label="Domain Authority" value={overview.seoStats.domainAuthority ?? '--'} />
              <StatCard label="Page Authority" value={overview.seoStats.pageAuthority ?? '--'} />
              <StatCard label="Spam Score" value={overview.seoStats.spamScore ?? '--'} />
              <StatCard
                label="Linking Domains"
                value={overview.seoStats.linkingRootDomains !== null ? formatNumber(overview.seoStats.linkingRootDomains) : '--'}
              />
              <StatCard
                label="Backlinks"
                value={overview.seoStats.externalBacklinks !== null ? formatNumber(overview.seoStats.externalBacklinks) : '--'}
              />
            </div>
          ) : (
            <p className="text-sm text-red-600">{overview.seoStatsError || 'Domain authority data is unavailable.'}</p>
          )}
        </section>
      ) : null}

      <section className="border border-neutral-200 bg-white p-4">
        <SectionHeading right={<Link href="/admin/articles" className="text-xs font-bold text-red-600 hover:underline">View All</Link>}>
          Recent Articles
        </SectionHeading>
        <div className="flex flex-col divide-y divide-neutral-100">
          {recentArticles.map((article) => (
            <Link
              key={article.id}
              href={`/${article.slug}`}
              target="_blank"
              className="flex items-center gap-3 py-3 hover:bg-neutral-50"
            >
              {article.featuredImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={article.featuredImage.sourceUrl} alt="" className="h-12 w-16 shrink-0 border border-neutral-200 object-cover" />
              ) : (
                <div className="h-12 w-16 shrink-0 border border-neutral-200 bg-neutral-100" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900">{article.title}</p>
                <p className="text-xs text-neutral-500">
                  {article.author?.name ?? 'Unknown'}
                  {article.publishedAt
                    ? ` / ${new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : ''}
                </p>
              </div>
              {article.articleCategories?.find((ac) => ac.isPrimary) ? (
                <span className="shrink-0 bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                  {article.articleCategories.find((ac) => ac.isPrimary)!.category.name}
                </span>
              ) : null}
              <span className="shrink-0 text-[10px] text-neutral-400">ID {article.id}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
