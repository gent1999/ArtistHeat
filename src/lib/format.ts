export function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function primaryCategoryOf(article: { articleCategories?: { isPrimary: boolean; category: { id: number; name: string; slug: string } }[] }) {
  return article.articleCategories?.find((c) => c.isPrimary)?.category ?? article.articleCategories?.[0]?.category ?? null;
}
