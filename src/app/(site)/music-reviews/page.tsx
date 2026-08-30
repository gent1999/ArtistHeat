import type { Metadata } from 'next';
import { EditorialArchive, editorialArchiveMetadata } from '@/components/EditorialArchive';

type Props = { searchParams: Promise<{ page?: string }> };

const PATH = '/music-reviews';
const HEADING = 'Music Reviews';
const DESCRIPTION = 'ArtistHeat breaks down the singles, EPs, and albums worth your time.';

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page } = await searchParams;
  return editorialArchiveMetadata({ path: PATH, heading: HEADING, description: DESCRIPTION, page: Number(page) || 1 });
}

export default async function MusicReviewsPage({ searchParams }: Props) {
  const { page } = await searchParams;
  return (
    <EditorialArchive editorialType="MUSIC_REVIEW" path={PATH} heading={HEADING} description={DESCRIPTION} page={Number(page) || 1} />
  );
}
