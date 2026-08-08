// Real social handles/URLs and follower counts, once known. Kept in one
// place rather than scattered across components so updating a count
// later doesn't mean hunting through JSX. `count: null` means "don't
// show a number" -- never fabricate a placeholder count.
export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'pinterest' | 'linkedin' | 'x';
  label: string;
  url: string | null;
  count: number | null;
  countLabel: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: 'facebook', label: 'Facebook', url: null, count: null, countLabel: 'Fans' },
  { platform: 'instagram', label: 'Instagram', url: null, count: null, countLabel: 'Followers' },
  { platform: 'pinterest', label: 'Pinterest', url: null, count: null, countLabel: 'Followers' },
  { platform: 'linkedin', label: 'LinkedIn', url: null, count: null, countLabel: 'Connections' },
  { platform: 'x', label: 'X', url: null, count: null, countLabel: 'Followers' },
];
