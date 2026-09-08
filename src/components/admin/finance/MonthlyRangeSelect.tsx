'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// Drives the Monthly Overview panel's range via a URL search param instead
// of a client-side fetch -- api.ts is server-only (see its own header
// comment), so re-fetching on change means navigating and letting the
// server component re-render with the new range.
export function MonthlyRangeSelect({ range, availableYears }: { range: string; availableYears: number[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select value={range} onChange={handleChange} className="border border-neutral-300 px-2 py-1 text-xs font-semibold">
      <option value="last12">Last 12 Months</option>
      {availableYears.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
}
