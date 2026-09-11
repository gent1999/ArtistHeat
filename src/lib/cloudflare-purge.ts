// Cloudflare edge cache purging for the public site. This is a best-effort
// companion to the Next.js cache invalidation in admin/actions.ts (updateTag
// / revalidatePath), not a replacement for it -- Next's own cache is always
// invalidated first, independent of anything in this file. This module is
// only ever imported from 'use server' action files, reads its credentials
// from server-only env vars (CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID, never
// NEXT_PUBLIC_-prefixed), and never returns or logs the token itself.
import { SITE_URL } from '@/lib/site';

const PURGE_ENDPOINT_BASE = 'https://api.cloudflare.com/client/v4/zones';
// Cloudflare's purge-by-URL endpoint accepts at most 30 files per request.
const MAX_URLS_PER_BATCH = 30;
const REQUEST_TIMEOUT_MS = 8000;

async function purgeBatch(zoneId: string, token: string, files: string[]): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${PURGE_ENDPOINT_BASE}/${zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files }),
      signal: controller.signal,
    });

    const body = (await res.json().catch(() => null)) as { success?: boolean; errors?: unknown[] } | null;

    if (!res.ok || !body?.success) {
      console.error('[cloudflare-purge] purge_cache request was rejected', {
        status: res.status,
        errors: body?.errors,
        urlCount: files.length,
      });
    }
  } catch (err) {
    console.error('[cloudflare-purge] purge_cache request failed', {
      error: err instanceof Error ? err.message : err,
      urlCount: files.length,
    });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Best-effort Cloudflare edge cache purge for a set of public URLs.
 *
 * Never throws: a Cloudflare outage, timeout, or missing/misconfigured
 * credentials must never fail the admin action that triggered it -- the
 * database write already happened and is what matters. Every failure is
 * logged (without ever logging the token) and swallowed.
 *
 * A no-op, logged as a warning, when CLOUDFLARE_API_TOKEN or
 * CLOUDFLARE_ZONE_ID aren't set -- safe to call before those are configured
 * in Vercel; Next's own updateTag/revalidatePath invalidation still applies
 * regardless.
 */
export async function purgeCloudflareUrls(urls: (string | null | undefined)[]): Promise<void> {
  try {
    const uniqueUrls = [...new Set(urls.filter((url): url is string => Boolean(url)))];
    if (uniqueUrls.length === 0) return;

    const token = process.env.CLOUDFLARE_API_TOKEN;
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    if (!token || !zoneId) {
      console.warn('[cloudflare-purge] skipped -- CLOUDFLARE_API_TOKEN/CLOUDFLARE_ZONE_ID not configured', {
        urlCount: uniqueUrls.length,
      });
      return;
    }

    const batches: string[][] = [];
    for (let i = 0; i < uniqueUrls.length; i += MAX_URLS_PER_BATCH) {
      batches.push(uniqueUrls.slice(i, i + MAX_URLS_PER_BATCH));
    }

    await Promise.all(batches.map((files) => purgeBatch(zoneId, token, files)));
  } catch (err) {
    // Belt-and-suspenders: purgeBatch already catches its own errors, but
    // this guarantees the calling admin action can never fail because of
    // anything in this module, no matter what goes wrong above it.
    console.error('[cloudflare-purge] unexpected failure building/sending purge request', err);
  }
}

// Editorial archive pages that list articles by editorialType -- see
// src/app/(site)/{interviews,artists,music-reviews,new-releases}/page.tsx.
// Editorial types without a dedicated archive page (MUSIC_NEWS, FASHION,
// STREETWEAR, BRAND_SPOTLIGHT, CULTURE, OTHER) intentionally have no entry
// here; /heat-check is driven by site settings, not article data, and is
// purged separately in updateHomepageSpotifyPlaylistAction.
const EDITORIAL_TYPE_PATHS: Partial<Record<string, string>> = {
  INTERVIEW: '/interviews',
  ARTIST_SPOTLIGHT: '/artists',
  MUSIC_REVIEW: '/music-reviews',
  NEW_RELEASE: '/new-releases',
};

export interface ArticlePurgeInput {
  /** The article's current slug -- omit only if the article no longer exists (a failed delete lookup). */
  slug?: string | null;
  /** The article's slug before this edit, if different from `slug` (a renamed article needs both purged). */
  previousSlug?: string | null;
  /**
   * Categories/tags/authors to purge archive pages for. Pass the union of
   * the pre- and post-edit sets on an update (see updateArticleAction) so a
   * category/tag/author an article was *removed* from gets purged too, not
   * just the ones it's in now -- duplicates are fine, URLs are deduped below.
   */
  categories?: { slug: string }[];
  tags?: { slug: string }[];
  /** Accepts multiple so an edit can purge both the old and new author's page in one call. */
  authorSlugs?: (string | null | undefined)[];
  editorialTypes?: string[];
}

/**
 * Maps an article's data to the public URLs whose Cloudflare cache should be
 * purged after a publish/edit/delete/feature-toggle -- using ArtistHeat's
 * actual route structure (see src/app/(site)) rather than purging the whole
 * zone. The homepage and sitemap are always included since every mutation
 * can change what they list.
 */
export function articlePurgeUrls(input: ArticlePurgeInput): string[] {
  const urls = new Set<string>([`${SITE_URL}/`, `${SITE_URL}/sitemap.xml`]);

  if (input.slug) urls.add(`${SITE_URL}/${input.slug}`);
  if (input.previousSlug && input.previousSlug !== input.slug) urls.add(`${SITE_URL}/${input.previousSlug}`);

  for (const category of input.categories ?? []) urls.add(`${SITE_URL}/category/${category.slug}`);
  for (const tag of input.tags ?? []) urls.add(`${SITE_URL}/tag/${tag.slug}`);
  for (const authorSlug of input.authorSlugs ?? []) {
    if (authorSlug) urls.add(`${SITE_URL}/author/${authorSlug}`);
  }

  for (const type of input.editorialTypes ?? []) {
    const path = EDITORIAL_TYPE_PATHS[type];
    if (path) urls.add(`${SITE_URL}${path}`);
  }

  return [...urls];
}
