import { NewsletterWidget } from '@/components/NewsletterWidget';
import { TrendingThisWeek } from '@/components/TrendingThisWeek';

// FollowArtistHeat (fan/follower counts) belongs here too, once real
// numbers/handles exist in lib/social.ts -- deliberately left out rather
// than shown with fabricated counts.
export function Sidebar() {
  return (
    <aside className="flex flex-col gap-6">
      <NewsletterWidget />
      <TrendingThisWeek />
    </aside>
  );
}
