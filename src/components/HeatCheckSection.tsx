import { api } from '@/lib/api';
import { parseSpotifyEmbedUrl } from '@/lib/format';

// Branded homepage spot for the site-wide Heat Check playlist (managed at
// /admin/spotify) -- the same embed also lives via SpotifyPlaylistWidget
// (homepage sidebar, article pages); this just gives it a bigger, editorial
// presence of its own, centered rather than paired with a story grid.
export async function HeatCheckSection() {
  const { settings } = await api.getSiteSettings();
  const embedUrl = parseSpotifyEmbedUrl(settings.homepageSpotifyPlaylistUrl);
  if (!embedUrl) return null;

  return (
    <section>
      <div className="mb-5 border-b-2 border-neutral-900 pb-2 text-center">
        <h2 className="text-xl font-extrabold uppercase tracking-wide">Heat Check</h2>
        <p className="mt-1 text-sm text-neutral-500">What ArtistHeat has in rotation.</p>
      </div>
      <iframe
        src={embedUrl}
        width="100%"
        height="380"
        style={{ border: 0 }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="ArtistHeat Heat Check playlist"
        className="mx-auto block max-w-[420px]"
      />
      <a
        href={settings.homepageSpotifyPlaylistUrl!}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-auto mt-3 block w-fit text-sm font-semibold text-red-600 hover:underline"
      >
        Open Playlist &rarr;
      </a>
    </section>
  );
}
