import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { FeaturedSection } from '@/components/FeaturedSection';
import { EditorialSection } from '@/components/EditorialSection';
import { FaceOfTheHeatSection } from '@/components/FaceOfTheHeatSection';
import { HeatCheckSection } from '@/components/HeatCheckSection';
import { Sidebar } from '@/components/Sidebar';
import { SITE_URL } from '@/lib/site';

// `absolute` bypasses the root layout's title.template ("%s | ArtistHeat")
// -- without it this would render as "...Culture | ArtistHeat", duplicating
// the brand name. openGraph/twitter are deliberately left undefined here:
// Next.js resolves their title/description from these same fields, and the
// banner image/siteName/card type stay inherited from the root layout
// rather than being redefined (and risking drifting out of sync) here.
export const metadata: Metadata = {
  title: { absolute: 'ArtistHeat - Hip-Hop News, Artist Interviews, Reviews & Culture' },
  description:
    'Discover the latest hip-hop and R&B news, artist interviews, music reviews, underground artists, and culture on ArtistHeat.',
  alternates: { canonical: SITE_URL },
};

export default async function HomePage() {
  const { featured, freshHeat, faceOfTheHeat, firstListen, heatCheckStories, nextUp, styleReport, mostHeated } =
    await api.getHome();

  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-10 pb-6">
      <h1 className="sr-only">ArtistHeat</h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-10">
          <FeaturedSection articles={featured} />
          <EditorialSection
            heading="Fresh Heat"
            subtitle="New music, new names, no filler."
            articles={freshHeat}
          />
          <FaceOfTheHeatSection articles={faceOfTheHeat} />
          <EditorialSection
            heading="First Listen"
            subtitle="Singles, projects and records worth pressing play on."
            viewAllHref="/new-releases"
            articles={firstListen}
          />
          <HeatCheckSection articles={heatCheckStories} />
          <EditorialSection
            heading="Next Up"
            subtitle="Names you'll be hearing a lot more from."
            viewAllHref="/artists"
            articles={nextUp}
          />
          <EditorialSection
            heading="Style Report"
            subtitle="Streetwear, brands and the culture around them."
            articles={styleReport}
          />
          <EditorialSection
            heading="Most Heated"
            subtitle="What everyone's checking right now."
            articles={mostHeated}
          />
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
