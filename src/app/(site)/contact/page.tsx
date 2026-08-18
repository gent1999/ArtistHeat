import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Send us your work and get featured on ArtistHeat -- get in touch to submit art, pitch a story, or write for us.',
};

const REASONS = [
  'Promoting unique and talented artists across different creative fields.',
  'Featuring artists on our platform and social media channels.',
  'Sharing opportunities for guest writers who want to contribute.',
  'Collaborating with like-minded creators to make an impact in the art world.',
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[800px] px-4 py-14 text-center">
      <h1 className="mb-6 inline-block border-b-2 border-red-600 pb-2 text-3xl font-black tracking-wide text-red-600 uppercase">
        Get in Touch
      </h1>

      <p className="mb-2 text-lg text-neutral-700">Hey there, upcoming talents and artists! Send your work to:</p>
      <a
        href="mailto:info@artistheat.com"
        className="inline-block bg-neutral-100 px-4 py-2 text-lg font-bold text-neutral-900 transition-colors hover:bg-red-600 hover:text-white"
      >
        info@artistheat.com
      </a>
      <p className="mt-4 text-lg text-neutral-700">and get featured on our platform. Get discovered right here.</p>

      <p className="mt-8 text-neutral-700">
        You can send your artwork to us and get featured on Facebook. We showcase underrated pop, rap, R&amp;B,
        house, urban, afro, queer musicians, comedians, fashion &amp; graphic designers, talented creators, poets,
        and more. Talent is talent!
      </p>

      <p className="mt-6 text-lg font-semibold text-red-600">Art is big. You make art? You deserve big!</p>

      <p className="mt-6 text-neutral-700">
        We are also looking for guest writers to share their thoughts and ideas about an artist&rsquo;s life, art,
        and creativity. Your voice matters!
      </p>

      <p className="mt-6 text-neutral-700">
        Let&rsquo;s grow this brand together.{' '}
        <a href="mailto:info@artistheat.com" className="font-bold text-red-600 hover:underline">
          info@artistheat.com
        </a>
      </p>

      <div className="mt-12 border border-neutral-200 p-8 text-left">
        <h2 className="mb-3 text-xl font-black tracking-wide uppercase">Why Work with Us?</h2>
        <p className="mb-4 text-neutral-700">
          We are passionate about creativity and strive to represent the voices that deserve recognition. Here&rsquo;s
          what we offer:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-neutral-700">
          {REASONS.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
