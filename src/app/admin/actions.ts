'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, updateTag } from 'next/cache';
import { ApiError, api } from '@/lib/api';
import { clearSessionToken, setSessionToken, getSessionToken } from '@/lib/session';
import { slugify } from '@/lib/format';
import { articlePurgeUrls, purgeCloudflareUrls } from '@/lib/cloudflare-purge';
import { SITE_URL } from '@/lib/site';

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');

  try {
    const { token } = await api.login(email, password);
    await setSessionToken(token);
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: err.status === 401 ? 'Invalid email or password' : err.message };
    }
    return { error: 'Something went wrong. Try again.' };
  }

  redirect('/admin');
}

export async function logoutAction() {
  await clearSessionToken();
  redirect('/admin/login');
}

// Resolves free-typed, comma-separated tag names to tag IDs -- matching
// existing tags case-insensitively and creating any that don't exist yet,
// so the admin never has to know a tag's exact stored name/slug.
async function resolveTagIds(rawTags: string, token: string): Promise<number[]> {
  const names = [...new Set(rawTags.split(',').map((t) => t.trim()).filter(Boolean))];
  if (names.length === 0) return [];

  const { tags: existing } = await api.listTags(token);
  const byName = new Map(existing.map((t) => [t.name.toLowerCase(), t.id]));

  const ids: number[] = [];
  for (const name of names) {
    const existingId = byName.get(name.toLowerCase());
    if (existingId) {
      ids.push(existingId);
      continue;
    }
    const { tag } = await api.createTag({ name, slug: slugify(name) }, token);
    ids.push(tag.id);
  }
  return ids;
}

// Same idea as resolveTagIds, but for the single free-typed author name --
// reuse an existing byline case-insensitively, or create one on the fly.
async function resolveAuthorId(rawName: string, token: string): Promise<number | null> {
  const name = rawName.trim();
  if (!name) return null;

  const { authors: existing } = await api.listAuthors(token);
  const match = existing.find((a) => a.name.toLowerCase() === name.toLowerCase());
  if (match) return match.id;

  const { author } = await api.createAuthor({ name, slug: slugify(name) }, token);
  return author.id;
}

// Resolves the 3 gallery-image slots (see GallerySlots.tsx) to media IDs --
// same "only create a new Media row if the URL actually changed" logic as
// the featured image, applied per slot so an edit-without-touching-photos
// doesn't leave behind duplicate Media rows.
async function resolveGalleryImageIds(formData: FormData, token: string): Promise<number[]> {
  const ids: number[] = [];
  for (let i = 0; i < 3; i++) {
    const url = String(formData.get(`galleryImageUrl${i}`) || '').trim();
    if (!url) continue;

    const alt = String(formData.get(`galleryImageAlt${i}`) || '').trim() || null;
    const originalUrl = String(formData.get(`originalGalleryUrl${i}`) || '').trim();
    const originalIdRaw = String(formData.get(`originalGalleryMediaId${i}`) || '').trim();

    if (originalIdRaw && url === originalUrl) {
      ids.push(Number(originalIdRaw));
    } else {
      const { media } = await api.createMedia({ sourceUrl: url, altText: alt }, token);
      ids.push(media.id);
    }
  }
  return ids;
}

// Hands the client a short-lived, upload-only Cloudinary signature so the
// browser can upload the file directly (never through our own server --
// Vercel's serverless functions cap request bodies well under typical
// image sizes). The admin JWT itself never reaches the browser; only this
// scoped signature does.
export async function getUploadSignatureAction() {
  const token = await getSessionToken();
  if (!token) redirect('/admin/login');
  return api.getUploadSignature(token);
}

export async function createArticleAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const token = await getSessionToken();
  if (!token) redirect('/admin/login');

  const title = String(formData.get('title') || '').trim();
  const slug = String(formData.get('slug') || '').trim();
  const content = String(formData.get('content') || '').trim();

  if (!title || !slug || !content) {
    return { error: 'Title, slug, and content are required.' };
  }

  let article;
  try {
    let featuredImageId: number | null = null;
    const imageUrl = String(formData.get('featuredImageUrl') || '').trim();
    if (imageUrl) {
      const altText = String(formData.get('featuredImageAlt') || '').trim() || null;
      const { media } = await api.createMedia({ sourceUrl: imageUrl, altText }, token);
      featuredImageId = media.id;
    }

    const tagIds = await resolveTagIds(String(formData.get('tags') || ''), token);
    const categoryIds = formData.getAll('categoryIds').map((v) => Number(v));
    const primaryCategoryIdRaw = String(formData.get('primaryCategoryId') || '');
    const primaryCategoryId = primaryCategoryIdRaw ? Number(primaryCategoryIdRaw) : categoryIds[0] ?? null;

    const authorId = await resolveAuthorId(String(formData.get('author') || ''), token);
    const featuredOrderRaw = String(formData.get('featuredOrder') || '');
    const galleryImageIds = await resolveGalleryImageIds(formData, token);

    ({ article } = await api.createArticle(
      {
        title,
        slug,
        excerpt: String(formData.get('excerpt') || '').trim() || null,
        content,
        status: 'published',
        authorId,
        featuredImageId,
        seoTitle: String(formData.get('seoTitle') || '').trim() || null,
        seoDescription: String(formData.get('seoDescription') || '').trim() || null,
        seoFocusKeyword: String(formData.get('seoFocusKeyword') || '').trim() || null,
        spotifyUrl: String(formData.get('spotifyUrl') || '').trim() || null,
        soundcloudUrl: String(formData.get('soundcloudUrl') || '').trim() || null,
        youtubeUrl: String(formData.get('youtubeUrl') || '').trim() || null,
        isFeatured: formData.get('isFeatured') === 'on',
        featuredOrder: featuredOrderRaw ? Number(featuredOrderRaw) : null,
        editorialTypes: formData.getAll('editorialTypes').map(String),
        isTrending: formData.get('isTrending') === 'on',
        isEditorsPick: formData.get('isEditorsPick') === 'on',
        categoryIds,
        primaryCategoryId,
        tagIds,
        galleryImageIds,
      },
      token
    ));
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong creating the article. Try again.' };
  }

  // The database write already succeeded at this point -- everything below
  // is cache invalidation, which must never turn into an error the admin
  // sees after a successful publish (hence it's outside the try/catch
  // above). updateTag covers Vercel's own cache instantly; the Cloudflare
  // purge covers the edge cache sitting in front of it, targeted at only
  // the URLs this article actually appears on rather than the whole zone.
  updateTag('articles');
  await purgeCloudflareUrls(
    articlePurgeUrls({
      slug: article.slug,
      categories: article.articleCategories?.map((ac) => ac.category),
      tags: article.articleTags?.map((at) => at.tag),
      authorSlugs: [article.author?.slug],
      editorialTypes: article.articleEditorialTypes?.map((e) => e.editorialType),
    })
  );
  redirect('/admin/articles');
}

// Editing intentionally never touches status/isFeatured/featuredOrder --
// featuring is exclusively managed by the star toggle on the articles list
// (setFeaturedLevelAction below), so this can't drift out of sync with its
// max-1-hero/max-3-regular enforcement.
export async function updateArticleAction(
  articleId: number,
  currentSlug: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const token = await getSessionToken();
  if (!token) redirect('/admin/login');

  const title = String(formData.get('title') || '').trim();
  const slug = String(formData.get('slug') || '').trim();
  const content = String(formData.get('content') || '').trim();

  if (!title || !slug || !content) {
    return { error: 'Title, slug, and content are required.' };
  }

  // Best-effort only, and admin-authenticated (not a public fetch) -- reuses
  // the same api.getArticle helper the edit page itself already calls, just
  // to snapshot which categories/tags/author this article is *leaving*
  // before the edit overwrites them. If it fails, the edit still proceeds;
  // the purge below just falls back to only the post-edit state (same as
  // before this existed).
  let previousArticle: Awaited<ReturnType<typeof api.getArticle>>['article'] | null = null;
  try {
    ({ article: previousArticle } = await api.getArticle(currentSlug, token));
  } catch {
    previousArticle = null;
  }

  let article;
  try {
    // Only create a new Media row if the image actually changed -- otherwise
    // every save-without-touching-the-image would leave behind an orphaned
    // duplicate pointing at the same URL.
    const newImageUrl = String(formData.get('featuredImageUrl') || '').trim();
    const originalImageUrl = String(formData.get('originalFeaturedImageUrl') || '').trim();
    const originalImageIdRaw = String(formData.get('originalFeaturedImageId') || '').trim();
    let featuredImageId: number | null = originalImageIdRaw ? Number(originalImageIdRaw) : null;

    if (newImageUrl && newImageUrl !== originalImageUrl) {
      const altText = String(formData.get('featuredImageAlt') || '').trim() || null;
      const { media } = await api.createMedia({ sourceUrl: newImageUrl, altText }, token);
      featuredImageId = media.id;
    } else if (!newImageUrl) {
      featuredImageId = null;
    }

    const tagIds = await resolveTagIds(String(formData.get('tags') || ''), token);
    const categoryIds = formData.getAll('categoryIds').map((v) => Number(v));
    const primaryCategoryIdRaw = String(formData.get('primaryCategoryId') || '');
    const primaryCategoryId = primaryCategoryIdRaw ? Number(primaryCategoryIdRaw) : categoryIds[0] ?? null;

    const authorId = await resolveAuthorId(String(formData.get('author') || ''), token);
    const galleryImageIds = await resolveGalleryImageIds(formData, token);

    ({ article } = await api.updateArticle(
      articleId,
      {
        title,
        slug,
        excerpt: String(formData.get('excerpt') || '').trim() || null,
        content,
        authorId,
        featuredImageId,
        seoTitle: String(formData.get('seoTitle') || '').trim() || null,
        seoDescription: String(formData.get('seoDescription') || '').trim() || null,
        seoFocusKeyword: String(formData.get('seoFocusKeyword') || '').trim() || null,
        spotifyUrl: String(formData.get('spotifyUrl') || '').trim() || null,
        soundcloudUrl: String(formData.get('soundcloudUrl') || '').trim() || null,
        youtubeUrl: String(formData.get('youtubeUrl') || '').trim() || null,
        editorialTypes: formData.getAll('editorialTypes').map(String),
        isTrending: formData.get('isTrending') === 'on',
        isEditorsPick: formData.get('isEditorsPick') === 'on',
        categoryIds,
        galleryImageIds,
        primaryCategoryId,
        tagIds,
      },
      token
    ));
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong saving the article. Try again.' };
  }

  // Database write already succeeded -- cache invalidation below must never
  // surface as an error on a successful save (see the comment in
  // createArticleAction above for why this sits outside the try/catch).
  updateTag('articles');
  revalidatePath('/admin/articles');
  revalidatePath(`/${currentSlug}`);
  revalidatePath(`/${slug}`);
  revalidatePath('/');
  // Union of pre- and post-edit categories/tags/author/editorial types --
  // articlePurgeUrls dedupes by URL, so passing both sets just means a
  // category/tag/author this article was *removed* from also gets purged
  // immediately, not only the ones it's in now. previousArticle is null
  // when the best-effort fetch above failed, in which case this degrades to
  // exactly the old (post-edit-only) behavior.
  await purgeCloudflareUrls(
    articlePurgeUrls({
      slug: article.slug,
      previousSlug: currentSlug,
      categories: [...(previousArticle?.articleCategories ?? []), ...(article.articleCategories ?? [])].map(
        (ac) => ac.category
      ),
      tags: [...(previousArticle?.articleTags ?? []), ...(article.articleTags ?? [])].map((at) => at.tag),
      authorSlugs: [previousArticle?.author?.slug, article.author?.slug],
      editorialTypes: [
        ...(previousArticle?.articleEditorialTypes ?? []),
        ...(article.articleEditorialTypes ?? []),
      ].map((e) => e.editorialType),
    })
  );
  redirect('/admin/articles');
}

// featuredOrder = HERO_ORDER marks the single "big featured" hero article;
// isFeatured=true with featuredOrder=null marks one of the (up to 3)
// regular featured side cards. Mirrors how FeaturedSection/home.ts sort
// and slice the featured set on the public site.
const HERO_ORDER = 1;
const MAX_REGULAR_FEATURED = 3;

export type FeaturedLevel = 0 | 1 | 2;

// Cycles an article through unfeatured -> regular featured (1 star) ->
// big featured / hero (2 stars) -> unfeatured. "Only 1 hero" is enforced
// by refusing to steal the slot: trying to promote a 2nd article to hero
// while one already exists resets that article to unfeatured instead
// (skips the hero state rather than bumping whoever currently holds it).
// "Only 3 regular" is enforced the same way -- refusing the change rather
// than guessing which of the existing 3 to bump.
export async function setFeaturedLevelAction(
  articleId: number,
  articleSlug: string,
  level: FeaturedLevel
): Promise<{ error?: string }> {
  const token = await getSessionToken();
  if (!token) redirect('/admin/login');

  // Featuring never touches categories/tags/author, and ArticleCard (used on
  // every category/tag/author archive page) doesn't render a featured badge
  // -- only the homepage's featured section and the article's own page
  // (`isFeatured` badge) display it, so that's all this ever needs to purge.
  const purgeFeaturedPages = () => purgeCloudflareUrls([`${SITE_URL}/`, `${SITE_URL}/${articleSlug}`]);

  try {
    if (level === 2) {
      const { articles: currentlyFeatured } = await api.listArticles({ isFeatured: true, pageSize: 10 }, token);
      const currentHero = currentlyFeatured.find((a) => a.featuredOrder === HERO_ORDER && a.id !== articleId);
      if (currentHero) {
        await api.updateArticle(articleId, { isFeatured: false, featuredOrder: null }, token);
        updateTag('articles');
        revalidatePath('/admin/articles');
        revalidatePath('/');
        await purgeFeaturedPages();
        return { error: 'Only one article can be the big feature. Un-feature it first to promote a different one.' };
      }
      await api.updateArticle(articleId, { isFeatured: true, featuredOrder: HERO_ORDER }, token);
    } else if (level === 1) {
      const { articles: currentlyFeatured } = await api.listArticles({ isFeatured: true, pageSize: 10 }, token);
      const regularCount = currentlyFeatured.filter((a) => a.featuredOrder !== HERO_ORDER && a.id !== articleId).length;
      if (regularCount >= MAX_REGULAR_FEATURED) {
        return { error: `Only ${MAX_REGULAR_FEATURED} articles can be regularly featured at once. Un-feature one first.` };
      }
      await api.updateArticle(articleId, { isFeatured: true, featuredOrder: null }, token);
    } else {
      await api.updateArticle(articleId, { isFeatured: false, featuredOrder: null }, token);
    }
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong updating the featured status.' };
  }

  updateTag('articles');
  revalidatePath('/admin/articles');
  revalidatePath('/');
  await purgeFeaturedPages();
  return {};
}

export async function deleteArticleAction(articleId: number, articleSlug: string): Promise<{ error?: string }> {
  const token = await getSessionToken();
  if (!token) redirect('/admin/login');

  // Best-effort only -- once the article is deleted there's no way to look
  // this back up, so fetch it first purely to know which category/tag/author
  // pages it was appearing on. If this fails (e.g. already gone), the purge
  // below just falls back to the article/home/sitemap URLs, which is still
  // correct, just less targeted -- it never blocks the delete itself.
  let previousArticle: Awaited<ReturnType<typeof api.getArticle>>['article'] | null = null;
  try {
    ({ article: previousArticle } = await api.getArticle(articleSlug, token));
  } catch {
    previousArticle = null;
  }

  try {
    await api.deleteArticle(articleId, token);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong deleting the article.' };
  }

  updateTag('articles');
  revalidatePath('/admin/articles');
  revalidatePath(`/${articleSlug}`);
  revalidatePath('/');
  await purgeCloudflareUrls(
    articlePurgeUrls({
      slug: articleSlug,
      categories: previousArticle?.articleCategories?.map((ac) => ac.category),
      tags: previousArticle?.articleTags?.map((at) => at.tag),
      authorSlugs: [previousArticle?.author?.slug],
      editorialTypes: previousArticle?.articleEditorialTypes?.map((e) => e.editorialType),
    })
  );
  return {};
}

export async function createUserAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const token = await getSessionToken();
  if (!token) redirect('/admin/login');

  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const name = String(formData.get('name') || '').trim();
  const role = formData.get('role') === 'admin' ? 'admin' : 'editor';

  if (!email || !password || !name) {
    return { error: 'Email, password, and name are required.' };
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  try {
    await api.createAdmin({ email, password, name, role }, token);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong creating the account. Try again.' };
  }

  revalidatePath('/admin/users');
  redirect('/admin/users');
}

export async function updateUserAction(userId: number, _prevState: { error?: string } | undefined, formData: FormData) {
  const token = await getSessionToken();
  if (!token) redirect('/admin/login');

  const email = String(formData.get('email') || '').trim();
  const name = String(formData.get('name') || '').trim();
  const role = formData.get('role') === 'admin' ? 'admin' : 'editor';
  const password = String(formData.get('password') || '');

  if (!email || !name) {
    return { error: 'Email and name are required.' };
  }
  if (password && password.length < 8) {
    return { error: 'New password must be at least 8 characters (or leave it blank to keep the current one).' };
  }

  try {
    await api.updateAdmin(userId, { email, name, role, ...(password ? { password } : {}) }, token);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong saving the account. Try again.' };
  }

  revalidatePath('/admin/users');
  redirect('/admin/users');
}

export async function deleteUserAction(userId: number): Promise<{ error?: string }> {
  const token = await getSessionToken();
  if (!token) redirect('/admin/login');

  try {
    await api.deleteAdmin(userId, token);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong deleting the account.' };
  }

  revalidatePath('/admin/users');
  return {};
}

export async function updateHomepageSpotifyPlaylistAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const token = await getSessionToken();
  if (!token) redirect('/admin/login');

  const url = String(formData.get('homepageSpotifyPlaylistUrl') || '').trim() || null;

  try {
    await api.updateSiteSettings({ homepageSpotifyPlaylistUrl: url }, token);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong saving the playlist. Try again.' };
  }

  updateTag('site-settings');
  revalidatePath('/admin/spotify');
  revalidatePath('/');
  // The playlist embed appears on the homepage sidebar and /heat-check --
  // see HomepageSpotifyWidget and src/app/(site)/heat-check/page.tsx.
  await purgeCloudflareUrls([`${SITE_URL}/`, `${SITE_URL}/heat-check`]);
  return {};
}
