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

const SPOTIFY_EMBED_TYPES = ['track', 'album', 'playlist', 'episode', 'show', 'artist'] as const;
type SpotifyEmbedType = (typeof SPOTIFY_EMBED_TYPES)[number];

// Playlist/album embeds already render their full tracklist inside
// Spotify's own iframe -- no extra work needed here beyond picking the
// right embed type/id out of the URL.
export function parseSpotifyEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'open.spotify.com') return null;
    const [, type, id] = parsed.pathname.split('/');
    if (!SPOTIFY_EMBED_TYPES.includes(type as SpotifyEmbedType) || !id) return null;
    return `https://open.spotify.com/embed/${type}/${id}`;
  } catch {
    return null;
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
