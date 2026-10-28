import { api } from '@/lib/api';
import { parseSpotifyEmbedUrl } from '@/lib/format';

export async function SpotifyPlaylistWidget() {
  const { settings } = await api.getSiteSettings();
  const embedUrl = parseSpotifyEmbedUrl(settings.homepageSpotifyPlaylistUrl);
  if (!embedUrl) return null;

  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="380"
      style={{ border: 0 }}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      title="ArtistHeat Spotify playlist"
    />
  );
}
