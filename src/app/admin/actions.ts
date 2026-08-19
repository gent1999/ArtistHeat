'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ApiError, api } from '@/lib/api';
import { clearSessionToken, setSessionToken, getSessionToken } from '@/lib/session';
import { slugify } from '@/lib/format';

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

    await api.createArticle(
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
        isFeatured: formData.get('isFeatured') === 'on',
        featuredOrder: featuredOrderRaw ? Number(featuredOrderRaw) : null,
        categoryIds,
        primaryCategoryId,
        tagIds,
      },
      token
    );
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong creating the article. Try again.' };
  }

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

    await api.updateArticle(
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
        categoryIds,
        primaryCategoryId,
        tagIds,
      },
      token
    );
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong saving the article. Try again.' };
  }

  revalidatePath('/admin/articles');
  revalidatePath(`/${currentSlug}`);
  revalidatePath(`/${slug}`);
  revalidatePath('/');
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
export async function setFeaturedLevelAction(articleId: number, level: FeaturedLevel): Promise<{ error?: string }> {
  const token = await getSessionToken();
  if (!token) redirect('/admin/login');

  try {
    if (level === 2) {
      const { articles: currentlyFeatured } = await api.listArticles({ isFeatured: true, pageSize: 10 }, token);
      const currentHero = currentlyFeatured.find((a) => a.featuredOrder === HERO_ORDER && a.id !== articleId);
      if (currentHero) {
        await api.updateArticle(articleId, { isFeatured: false, featuredOrder: null }, token);
        revalidatePath('/admin/articles');
        revalidatePath('/');
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

  revalidatePath('/admin/articles');
  revalidatePath('/');
  return {};
}

export async function deleteArticleAction(articleId: number, articleSlug: string): Promise<{ error?: string }> {
  const token = await getSessionToken();
  if (!token) redirect('/admin/login');

  try {
    await api.deleteArticle(articleId, token);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong deleting the article.' };
  }

  revalidatePath('/admin/articles');
  revalidatePath(`/${articleSlug}`);
  revalidatePath('/');
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
