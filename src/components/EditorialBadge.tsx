import { editorialTypeLabel } from '@/lib/editorial-types';

// Subtle text-only label (no background chip) so it doesn't compete with
// the red "Featured"/category badges already used on cards and hero art.
export function EditorialBadge({ type, className = '' }: { type: string | null | undefined; className?: string }) {
  const label = editorialTypeLabel(type);
  if (!label) return null;

  return <span className={`text-xs font-bold uppercase tracking-wide text-red-600 ${className}`}>{label}</span>;
}
