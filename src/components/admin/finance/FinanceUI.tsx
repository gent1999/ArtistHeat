// Shared Finance UI primitives -- matches the existing admin dashboard's
// visual language (sharp corners, neutral-200 borders, white cards, red-600
// accent bar on section headings) rather than inventing a new one. Reused
// across all three Finance pages.

export function FinancePageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  right,
  children,
  className = '',
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-neutral-200 bg-white p-4 ${className}`}>
      {title ? (
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-wide text-neutral-900 uppercase">
            <span className="h-3 w-1 bg-red-600" />
            {title}
          </h2>
          {right}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function KpiCard({
  label,
  value,
  primary = false,
  valueClassName = '',
}: {
  label: string;
  value: string;
  primary?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className={primary ? 'border-2 border-red-600 bg-white p-4' : 'border border-neutral-200 bg-white p-4'}>
      <div className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">{label}</div>
      <div className={`mt-1 font-bold tabular-nums ${primary ? 'text-3xl text-red-600' : 'text-xl text-neutral-900'} ${valueClassName}`}>
        {value}
      </div>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paid: 'bg-green-100 text-green-700',
  ready_for_payout: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  not_ready: 'bg-neutral-100 text-neutral-600',
  inactive: 'bg-neutral-100 text-neutral-500',
  cancelled: 'bg-red-100 text-red-700',
  paid_out: 'bg-neutral-100 text-neutral-600',
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-neutral-100 text-neutral-600';
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap uppercase tracking-wide ${style}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function ProgressBar({ progress, ready }: { progress: number; ready: boolean }) {
  return (
    <div className="h-1.5 w-full bg-neutral-100">
      <div className={`h-1.5 ${ready ? 'bg-green-600' : 'bg-red-600'}`} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
    </div>
  );
}
