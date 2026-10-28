import { NewsletterWidget } from '@/components/NewsletterWidget';
import { HomepageSpotifyWidget } from '@/components/HomepageSpotifyWidget';
import { SubmitMusicCta } from '@/components/SubmitMusicCta';

export function Sidebar() {
  return (
    <aside className="flex flex-col gap-6">
      <NewsletterWidget />
      <HomepageSpotifyWidget />
      <SubmitMusicCta />
    </aside>
  );
}
