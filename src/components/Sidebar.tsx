import { NewsletterWidget } from '@/components/NewsletterWidget';
import { SpotifyPlaylistWidget } from '@/components/SpotifyPlaylistWidget';
import { SubmitMusicCta } from '@/components/SubmitMusicCta';

export function Sidebar() {
  return (
    <aside className="flex flex-col gap-6">
      <NewsletterWidget />
      <SpotifyPlaylistWidget />
      <SubmitMusicCta />
    </aside>
  );
}
