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

// SoundCloud's widget takes the original canonical URL as-is (no ID
// extraction needed) and auto-detects track vs. playlist/set, rendering
// the full tracklist for the latter on its own.
export function buildSoundcloudEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!/(^|\.)soundcloud\.com$/.test(parsed.hostname)) return null;
    const params = new URLSearchParams({
      url,
      color: '#dd0000',
      auto_play: 'false',
      show_artwork: 'true',
    });
    return `https://w.soundcloud.com/player/?${params.toString()}`;
  } catch {
    return null;
  }
}

// Handles youtube.com/watch, youtu.be short links, youtube.com/embed
// (already-embed URLs), and youtube.com/playlist (playlist with no
// specific video). A video-in-playlist URL embeds that video with the
// playlist attached; a playlist-only URL embeds the full playlist via
// the videoseries embed, which lists every video in it automatically.
export function parseYoutubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\.|^m\./, '');
    let videoId: string | null = null;
    const playlistId = parsed.searchParams.get('list');

    if (host === 'youtu.be') {
      videoId = parsed.pathname.slice(1).split('/')[0] || null;
    } else if (host === 'youtube.com') {
      if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/')[2] || null;
      }
    } else {
      return null;
    }

    if (videoId) {
      return playlistId ? `https://www.youtube.com/embed/${videoId}?list=${playlistId}` : `https://www.youtube.com/embed/${videoId}`;
    }
    if (playlistId) {
      return `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
    }
    return null;
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
