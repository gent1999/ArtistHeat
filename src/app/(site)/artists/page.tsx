import type { Metadata } from 'next';
import { EditorialArchive, editorialArchiveMetadata } from '@/components/EditorialArchive';

type Props = { searchParams: Promise<{ page?: string }> };

const PATH = '/artists';
const HEADING = 'Artists';
const DESCRIPTION = 'Emerging artists ArtistHeat is putting on -- the names you should know before everyone else does.';

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page } = await searchParams;
  return editorialArchiveMetadata({ path: PATH, heading: HEADING, description: DESCRIPTION, page: Number(page) || 1 });
}

export default async function ArtistsPage({ searchParams }: Props) {
  const { page } = await searchParams;
  return (
    <EditorialArchive editorialType="ARTIST_SPOTLIGHT" path={PATH} heading={HEADING} description={DESCRIPTION} page={Number(page) || 1} />
  );
}
