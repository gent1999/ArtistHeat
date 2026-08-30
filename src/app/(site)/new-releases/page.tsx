import type { Metadata } from 'next';
import { EditorialArchive, editorialArchiveMetadata } from '@/components/EditorialArchive';

type Props = { searchParams: Promise<{ page?: string }> };

const PATH = '/new-releases';
const HEADING = 'New Releases';
const DESCRIPTION = 'The latest singles, projects, and records just landing.';

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page } = await searchParams;
  return editorialArchiveMetadata({ path: PATH, heading: HEADING, description: DESCRIPTION, page: Number(page) || 1 });
}

export default async function NewReleasesPage({ searchParams }: Props) {
  const { page } = await searchParams;
  return (
    <EditorialArchive editorialType="NEW_RELEASE" path={PATH} heading={HEADING} description={DESCRIPTION} page={Number(page) || 1} />
  );
}
