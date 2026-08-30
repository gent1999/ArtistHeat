import type { Metadata } from 'next';
import { EditorialArchive, editorialArchiveMetadata } from '@/components/EditorialArchive';

type Props = { searchParams: Promise<{ page?: string }> };

const PATH = '/interviews';
const HEADING = 'Interviews';
const DESCRIPTION = 'Conversations with the artists shaping hip-hop, rap, R&B, and the culture around them.';

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page } = await searchParams;
  return editorialArchiveMetadata({ path: PATH, heading: HEADING, description: DESCRIPTION, page: Number(page) || 1 });
}

export default async function InterviewsPage({ searchParams }: Props) {
  const { page } = await searchParams;
  return <EditorialArchive editorialType="INTERVIEW" path={PATH} heading={HEADING} description={DESCRIPTION} page={Number(page) || 1} />;
}
