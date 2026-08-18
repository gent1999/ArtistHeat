import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Collab & Advertising',
  description: 'Sponsored content, banners, and collaborations with ArtistHeat -- a growing brand across the web and social media.',
};

const OFFERINGS = ['Sponsored content with links', 'Posts on our Facebook page', 'Banners'];

export default function CollabAdvertisingPage() {
  return (
    <div className="mx-auto max-w-[800px] px-4 py-14 text-center">
      <h1 className="mb-6 inline-block border-b-2 border-red-600 pb-2 text-3xl font-black tracking-wide text-red-600 uppercase">
        Advertising
      </h1>

      <p className="text-lg text-neutral-700">
        Welcome to ArtistHeat &mdash; a new brand with limitless potential! Ready for collaborations, banners,
        sponsored content, and more. Let&rsquo;s spark creativity together!
      </p>
      <p className="mt-4 text-neutral-700">
        Want to work together? We are growing our brand on the web and social media. We offer:
      </p>

      <ul className="mx-auto mt-6 max-w-sm list-disc space-y-2 pl-5 text-left text-neutral-700">
        {OFFERINGS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <p className="mt-8 font-semibold text-red-600">Got any order ideas for collabs? Tell us!</p>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/contact"
          className="inline-block bg-red-600 px-6 py-3 font-bold text-white transition-colors hover:bg-red-700"
        >
          Contact Us
        </Link>
        <a
          href="mailto:info@artistheat.com"
          className="inline-block bg-neutral-100 px-6 py-3 font-bold text-neutral-900 transition-colors hover:bg-red-600 hover:text-white"
        >
          info@artistheat.com
        </a>
      </div>
    </div>
  );
}
