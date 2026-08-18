import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: "ArtistHeat is a stage for underrated musicians, artists, and creatives -- here's who we are and why we do it.",
};

const FEATURES = [
  {
    title: 'The Creative Lifestyle',
    body: "Being creative can be a blessing, but not every artist makes money with their art. Art is more than creativity; it's a lifestyle. We aim to support artists and creative people who want to turn their passion into a career. We give tips, ideas, advice, information and more.",
  },
  {
    title: 'Fresh Faces and Talent',
    body: "It's time for fresh faces and new talent. Many mainstream stars like Drake, Ice Spice, Riri, and Taylor Swift dominate the spotlight. While we respect talent like Taylor Swift, we believe in promoting underrated artists who deserve recognition.",
  },
  {
    title: 'A Different Approach',
    body: 'ArtistHeat takes a stand against the unfair practices in the creative industry. We focus on originality, helping people succeed, and giving them the stage they deserve. This is an anti-mainstream platform designed to uplift real talent (of course sometimes you see a little bit about famous ones).',
  },
  {
    title: 'A Stage for All Creatives',
    body: "We celebrate talent worldwide, from musicians to designers, photographers, comedians, actors, dancers, make-up artists, stylists, influencers, and top creators. If you're talented, you belong on ArtistHeat. Let's make the creative world fairer.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-14">
      <div className="mb-10 text-center">
        <h1 className="inline-block border-b-2 border-red-600 pb-2 text-3xl font-black tracking-wide text-red-600 uppercase">
          Who Are We?
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-700">
          <span className="font-semibold text-red-600">ArtistHeat</span> is inspired by magazines like Billboard,
          Complex, Highsnobiety, Hypebae, The Fader, but also magazines for the creatives: Creative Boom and Creative
          Review. We make a nice mix of artists and creatives: in the mix! We do it a little different. We admire the
          creative and artist industry. We love creating, thinking of original ideas, and helping artists thrive.
          Creativity and helping go hand in hand, and more people should embrace this idea.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="border border-neutral-200 p-8 shadow-sm">
            <h2 className="mb-3 inline-block border-b-2 border-red-600 pb-1 text-xl font-black tracking-wide uppercase">
              {feature.title}
            </h2>
            <p className="text-neutral-700">{feature.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 text-center text-neutral-700">
        <p>
          Have questions or want to collaborate? Reach us at{' '}
          <a href="mailto:info@artistheat.com" className="font-bold text-red-600 hover:underline">
            info@artistheat.com
          </a>
        </p>
      </div>
    </div>
  );
}
