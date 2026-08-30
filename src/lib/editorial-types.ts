// Editorial classification layered on top of the legacy Category system.
// Keep in sync with ServerHeat's `EditorialType` Prisma enum.
export const EDITORIAL_TYPES = [
  'INTERVIEW',
  'ARTIST_SPOTLIGHT',
  'MUSIC_REVIEW',
  'NEW_RELEASE',
  'MUSIC_NEWS',
  'FASHION',
  'STREETWEAR',
  'BRAND_SPOTLIGHT',
  'CULTURE',
  'OTHER',
] as const;

export type EditorialType = (typeof EDITORIAL_TYPES)[number];

export const EDITORIAL_TYPE_LABELS: Record<EditorialType, string> = {
  INTERVIEW: 'Interview',
  ARTIST_SPOTLIGHT: 'Artist Spotlight',
  MUSIC_REVIEW: 'Music Review',
  NEW_RELEASE: 'New Release',
  MUSIC_NEWS: 'Music News',
  FASHION: 'Fashion',
  STREETWEAR: 'Streetwear',
  BRAND_SPOTLIGHT: 'Brand Spotlight',
  CULTURE: 'Culture',
  OTHER: 'Other',
};

export function editorialTypeLabel(type: string | null | undefined): string | null {
  if (!type) return null;
  return EDITORIAL_TYPE_LABELS[type as EditorialType] ?? null;
}
