export function formatMoney(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Explicit +/- prefix (e.g. "+$5.00", "-$12.50") -- used anywhere a figure
// represents a signed change/net, like the "This Month" KPI.
export function formatSignedMoney(n: number): string {
  const sign = n < 0 ? '-' : '+';
  return `${sign}${formatMoney(Math.abs(n))}`;
}

export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return '--';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
