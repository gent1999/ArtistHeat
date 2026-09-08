'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Mirrors TrafficChart.tsx's exact visual language (same gridlines, tick
// styling, tooltip, gradient-fill Area technique) instead of inventing a
// new chart style -- just with two series (revenue/expenses) using the
// site's existing positive/negative color convention (green-600/red-600,
// the same pair the dashboard's traffic-change badges already use).
export function MonthlyFinanceChart({ data }: { data: { label: string; revenue: number; expenses: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="financeRevenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="financeExpensesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#DD0000" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#DD0000" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#e5e5e5" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#737373' }} axisLine={{ stroke: '#e5e5e5' }} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: '#737373' }}
          axisLine={false}
          tickLine={false}
          width={52}
          tickFormatter={(v: number) => `$${v.toLocaleString('en-US')}`}
        />
        <Tooltip
          contentStyle={{ borderRadius: 0, fontSize: 12, border: '1px solid #e5e5e5' }}
          labelStyle={{ fontWeight: 600 }}
          formatter={(value, name) => [
            `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            name === 'revenue' ? 'Revenue' : 'Expenses',
          ]}
        />
        <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} fill="url(#financeRevenueFill)" dot={{ r: 3, fill: '#16a34a' }} />
        <Area type="monotone" dataKey="expenses" stroke="#DD0000" strokeWidth={2} fill="url(#financeExpensesFill)" dot={{ r: 3, fill: '#DD0000' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
