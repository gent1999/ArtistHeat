import { NewsletterWidget } from '@/components/NewsletterWidget';
import { FollowSocial } from '@/components/FollowSocial';
import { HomepageSpotifyWidget } from '@/components/HomepageSpotifyWidget';
import { TrendingThisWeek } from '@/components/TrendingThisWeek';

// The "Follow ArtistHeat" fan/follower-count widget from the reference
// design is deliberately left out -- there's no live source for those
// numbers, and a hardcoded count just goes stale. FollowSocial below
// links the real profiles without claiming any follower counts.
export function Sidebar() {
  return (
    <aside className="flex flex-col gap-6">
      <NewsletterWidget />
      <FollowSocial />
      <HomepageSpotifyWidget />
      <TrendingThisWeek />
    </aside>
  );
}
