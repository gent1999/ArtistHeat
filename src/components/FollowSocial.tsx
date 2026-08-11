import { SOCIAL_LINKS } from '@/lib/social';
import { FacebookIcon, InstagramIcon, PinterestIcon } from './icons';

const ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  pinterest: PinterestIcon,
} as const;

export function FollowSocial() {
  return (
    <div className="border border-neutral-200 p-5">
      <h2 className="text-sm font-extrabold uppercase tracking-wide">Follow Us on Social Media</h2>
      <div className="mt-2 mb-4 h-0.5 w-10 bg-red-600" />
      <div className="flex gap-3">
        {SOCIAL_LINKS.map((link) => {
          const Icon = ICONS[link.platform];
          return (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="flex h-10 w-10 items-center justify-center bg-neutral-100 text-red-600 hover:bg-red-600 hover:text-white"
            >
              <Icon />
            </a>
          );
        })}
      </div>
    </div>
  );
}
