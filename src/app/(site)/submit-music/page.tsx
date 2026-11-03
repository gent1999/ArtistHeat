import type { Metadata } from 'next';
import { SubmitMusicForm } from './SubmitMusicForm';

export const metadata: Metadata = {
  title: 'Submit Your Music',
  description: 'Submit your music to ArtistHeat for a dedicated article. Free standard review, or $5 to skip the line.',
};

export default function SubmitMusicPage() {
  return <SubmitMusicForm />;
}
