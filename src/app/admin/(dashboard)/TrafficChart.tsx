'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function TrafficChart({ data }: { data: { label: string; sessions: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#DD0000" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#DD0000" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#e5e5e5" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#737373' }} axisLine={{ stroke: '#e5e5e5' }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} width={44} />
        <Tooltip
          contentStyle={{ borderRadius: 0, fontSize: 12, border: '1px solid #e5e5e5' }}
          labelStyle={{ fontWeight: 600 }}
          formatter={(value) => [Number(value).toLocaleString('en-US'), 'Sessions']}
        />
        <Area type="monotone" dataKey="sessions" stroke="#DD0000" strokeWidth={2} fill="url(#trafficFill)" dot={{ r: 3, fill: '#DD0000' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
