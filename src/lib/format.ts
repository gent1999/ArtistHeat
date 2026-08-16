export function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function primaryCategoryOf(article: { articleCategories?: { isPrimary: boolean; category: { id: number; name: string; slug: string } }[] }) {
  return article.articleCategories?.find((c) => c.isPrimary)?.category ?? article.articleCategories?.[0]?.category ?? null;
}

// Computed from actual word count (standard 200wpm), not stored data --
// the WP export had a Yoast-estimated reading time but it wasn't migrated.
export function estimateReadingTimeMinutes(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
