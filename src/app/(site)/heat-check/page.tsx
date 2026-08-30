import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { parseSpotifyEmbedUrl } from '@/lib/format';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Heat Check',
  description: 'What ArtistHeat has in rotation -- the official Heat Check playlist.',
  alternates: { canonical: `${SITE_URL}/heat-check` },
};

export default async function HeatCheckPage() {
  const { settings } = await api.getSiteSettings();
  const embedUrl = parseSpotifyEmbedUrl(settings.homepageSpotifyPlaylistUrl);

  return (
    <div className="mx-auto max-w-[800px] px-4 py-14">
      <h1 className="mb-2 text-3xl font-black uppercase tracking-wide text-red-600">Heat Check</h1>
      <p className="mb-8 text-neutral-600">What ArtistHeat has in rotation.</p>

      {embedUrl ? (
        <>
          <iframe
            src={embedUrl}
            width="100%"
            height="380"
            style={{ border: 0 }}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="ArtistHeat Heat Check playlist"
          />
          <a
            href={settings.homepageSpotifyPlaylistUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block bg-red-600 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-red-700"
          >
            Open on Spotify &rarr;
          </a>
        </>
      ) : (
        <p className="text-neutral-500">No playlist is live yet -- check back soon.</p>
      )}
    </div>
  );
}
