import { api } from '@/lib/api';
import { parseSpotifyEmbedUrl } from '@/lib/format';

export async function HomepageSpotifyWidget() {
  const { settings } = await api.getSiteSettings();
  const embedUrl = parseSpotifyEmbedUrl(settings.homepageSpotifyPlaylistUrl);
  if (!embedUrl) return null;

  return (
    <div className="border border-neutral-200 p-5">
      <h2 className="text-sm font-extrabold uppercase tracking-wide">On Spotify</h2>
      <div className="mt-2 mb-4 h-0.5 w-10 bg-red-600" />
      <iframe
        src={embedUrl}
        width="100%"
        height="380"
        style={{ border: 0 }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="ArtistHeat Spotify playlist"
      />
    </div>
  );
}
