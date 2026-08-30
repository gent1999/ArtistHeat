'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateHomepageSpotifyPlaylistAction } from '../../actions';
import { parseSpotifyEmbedUrl } from '@/lib/format';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
    >
      {pending ? 'Saving…' : 'Save Playlist'}
    </button>
  );
}

const inputClass = 'w-full border border-neutral-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium';

export function SpotifyPlaylistForm({ initialUrl }: { initialUrl: string | null }) {
  const [state, formAction] = useActionState(updateHomepageSpotifyPlaylistAction, undefined);
  const [url, setUrl] = useState(initialUrl ?? '');
  const embedUrl = parseSpotifyEmbedUrl(url);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <div>
        <label htmlFor="homepageSpotifyPlaylistUrl" className={labelClass}>
          Homepage Spotify Playlist
        </label>
        <input
          id="homepageSpotifyPlaylistUrl"
          name="homepageSpotifyPlaylistUrl"
          type="url"
          placeholder="https://open.spotify.com/playlist/..."
          className={inputClass}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <p className="mt-1 text-xs text-neutral-500">
          Shows on the homepage sidebar, between &ldquo;Follow Us on Social Media&rdquo; and &ldquo;Trending This
          Week.&rdquo; Clear the field and save to remove it.
        </p>
      </div>

      {embedUrl ? (
        <div>
          <p className={labelClass}>Preview</p>
          <iframe
            src={embedUrl}
            width="100%"
            height="380"
            style={{ border: 0 }}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify playlist preview"
          />
        </div>
      ) : url ? (
        <p className="text-xs text-red-600">That doesn&rsquo;t look like a valid open.spotify.com link.</p>
      ) : null}

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
