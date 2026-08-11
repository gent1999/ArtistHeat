// Real social handles. Kept in one place rather than scattered across
// components so adding/changing a link doesn't mean hunting through JSX.
// No follower/fan counts here on purpose -- there's no live source for
// them yet, and a hardcoded number just goes stale. Only list platforms
// ArtistHeat actually has a presence on.
export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'pinterest';
  label: string;
  url: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: 'facebook', label: 'Facebook', url: 'https://facebook.com/ArtistHeat' },
  { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/artistheat' },
  { platform: 'pinterest', label: 'Pinterest', url: 'https://pinterest.com/ArtistHeat' },
];
