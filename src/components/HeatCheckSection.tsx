import { api } from '@/lib/api';
import { parseSpotifyEmbedUrl } from '@/lib/format';
import { ArticleCard } from '@/components/ArticleCard';
import type { ArticleSummary } from '@/lib/api';

// Branded homepage rail around the site-wide Heat Check playlist (managed
// at /admin/spotify) -- the same embed also lives in the sidebar via
// HomepageSpotifyWidget; this just gives it a bigger, editorial presence
// alongside a few current music stories instead of leaving it sidebar-only.
export async function HeatCheckSection({ articles }: { articles: ArticleSummary[] }) {
  const { settings } = await api.getSiteSettings();
  const embedUrl = parseSpotifyEmbedUrl(settings.homepageSpotifyPlaylistUrl);
  if (!embedUrl) return null;

  const stories = articles.slice(0, 4);

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4 border-b-2 border-neutral-900 pb-2">
        <div>
          <h2 className="text-xl font-extrabold uppercase tracking-wide">Heat Check</h2>
          <p className="mt-1 text-sm text-neutral-500">What ArtistHeat has in rotation.</p>
        </div>
        <a
          href={settings.homepageSpotifyPlaylistUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm font-semibold text-red-600 hover:underline"
        >
          Open Playlist &rarr;
        </a>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <iframe
          src={embedUrl}
          width="100%"
          height="380"
          style={{ border: 0 }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="ArtistHeat Heat Check playlist"
        />
        {stories.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
            {stories.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
