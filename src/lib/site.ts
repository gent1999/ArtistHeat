export const SITE_URL = 'https://artistheat.com';

// Self-referencing canonical that respects pagination -- page 1 canonicals
// to the bare path, page 2+ includes the page param so Google doesn't
// treat legitimate paginated archive pages as duplicates of page 1.
export function canonicalWithPage(path: string, page: number): string {
  return page > 1 ? `${SITE_URL}${path}?page=${page}` : `${SITE_URL}${path}`;
}
