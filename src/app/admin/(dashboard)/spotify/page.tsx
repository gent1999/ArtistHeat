import { api } from '@/lib/api';
import { SpotifyPlaylistForm } from './SpotifyPlaylistForm';

export default async function AdminSpotifyPage() {
  const { settings } = await api.getSiteSettings();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Spotify</h1>
      <SpotifyPlaylistForm initialUrl={settings.homepageSpotifyPlaylistUrl} />
    </div>
  );
}
