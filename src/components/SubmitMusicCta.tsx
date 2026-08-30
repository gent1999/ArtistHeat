import Link from 'next/link';

// Points at /contact -- the site's existing "send us your work" destination
// (see ContactPage) -- rather than inventing a separate submission form or
// external service.
export function SubmitMusicCta() {
  return (
    <div className="border border-neutral-200 bg-neutral-950 p-5 text-white">
      <h2 className="text-sm font-extrabold uppercase tracking-wide">Submit Your Music</h2>
      <div className="mt-2 mb-4 h-0.5 w-10 bg-red-600" />
      <p className="mb-4 text-sm text-neutral-300">Got something worth hearing? Send it to ArtistHeat.</p>
      <Link
        href="/contact"
        className="block w-full bg-red-600 py-2 text-center text-sm font-bold uppercase tracking-wide text-white hover:bg-red-700"
      >
        Submit Music
      </Link>
    </div>
  );
}
