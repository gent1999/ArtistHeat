import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { SITE_URL } from '@/lib/site';

// ISR rather than force-dynamic or a build-time-only snapshot: crawlers
// don't need up-to-the-second freshness, and the underlying api.* calls
// already refresh instantly on publish/edit/delete via updateTag
// ('articles') in admin/actions.ts. This just bounds the worst case (a
// mutation that bypasses that action) instead of re-querying the backend
// for every article/category/tag/author on every crawl.
export const revalidate = 3600;

// Every section is independently wrapped in try/catch: a temporary backend
// outage should degrade the sitemap (skip that section), never fail the
// whole route or the production build.
async function articleEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const entries: MetadataRoute.Sitemap = [];
    let page = 1;
    let totalPages = 1;
    do {
      const { articles, pagination } = await api.listArticles({ page, pageSize: 100, status: 'published' });
      totalPages = pagination.totalPages;
      for (const article of articles) {
        entries.push({
          url: `${SITE_URL}/${article.slug}`,
          lastModified: article.updatedAt || article.publishedAt || undefined,
        });
      }
      page++;
    } while (page <= totalPages);
    return entries;
  } catch {
    return [];
  }
}

async function categoryEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const { categories } = await api.listCategories();
    return categories.map((category) => ({ url: `${SITE_URL}/category/${category.slug}` }));
  } catch {
    return [];
  }
}

async function tagEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const { tags } = await api.listTags();
    return tags.map((tag) => ({ url: `${SITE_URL}/tag/${tag.slug}` }));
  } catch {
    return [];
  }
}

async function authorEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const { authors } = await api.listAuthors();
    return authors.map((author) => ({ url: `${SITE_URL}/author/${author.slug}` }));
  } catch {
    return [];
  }
}

const EDITORIAL_ARCHIVE_PATHS = ['/interviews', '/artists', '/music-reviews', '/new-releases'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories, tags, authors] = await Promise.all([
    articleEntries(),
    categoryEntries(),
    tagEntries(),
    authorEntries(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/heat-check` },
    ...EDITORIAL_ARCHIVE_PATHS.map((path) => ({ url: `${SITE_URL}${path}` })),
  ];

  return [...staticEntries, ...articles, ...categories, ...tags, ...authors];
}
