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

// An article can carry several editorial types at once (like categories) --
// this pulls the plain list of type strings off the API's nested shape.
export function editorialTypesOf(article: { articleEditorialTypes?: { editorialType: string }[] }): string[] {
  return (article.articleEditorialTypes ?? []).map((e) => e.editorialType);
}

export function editorialTypeLabelsOf(article: { articleEditorialTypes?: { editorialType: string }[] }): string[] {
  return editorialTypesOf(article)
    .map((type) => editorialTypeLabel(type))
    .filter((label): label is string => Boolean(label));
}
