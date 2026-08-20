'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateArticleAction } from '../../../../actions';
import { uploadImageToCloudinary } from '@/lib/upload';
import { ContentEditor } from '../../ContentEditor';
import { GallerySlots } from '../../GallerySlots';
import type { Author, Category, ArticleDetail } from '@/lib/api';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
    >
      {pending ? 'Saving…' : 'Save Changes'}
    </button>
  );
}

const inputClass = 'w-full border border-neutral-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium';

export function EditArticleForm({
  article,
  authors,
  categories,
  existingTagNames,
}: {
  article: ArticleDetail;
  authors: Author[];
  categories: Category[];
  existingTagNames: string[];
}) {
  const updateWithId = updateArticleAction.bind(null, article.id, article.slug);
  const [state, formAction] = useActionState(updateWithId, undefined);
  const [slug, setSlug] = useState(article.slug);
  const initialCategoryIds = (article.articleCategories ?? []).map((ac) => ac.category.id);
  const initialPrimaryId = (article.articleCategories ?? []).find((ac) => ac.isPrimary)?.category.id ?? null;
  const [checkedCategoryIds, setCheckedCategoryIds] = useState<number[]>(initialCategoryIds);
  const [featuredImageUrl, setFeaturedImageUrl] = useState(article.featuredImage?.sourceUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadImageToCloudinary(file);
      setFeaturedImageUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <input type="hidden" name="originalFeaturedImageId" value={article.featuredImage?.id ?? ''} />
      <input type="hidden" name="originalFeaturedImageUrl" value={article.featuredImage?.sourceUrl ?? ''} />

      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input id="title" name="title" required className={inputClass} defaultValue={article.title} />
      </div>

      <div>
        <label htmlFor="slug" className={labelClass}>
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          required
          pattern="[a-z0-9\-]+"
          title="Lowercase letters, numbers, and hyphens only"
          className={inputClass}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <p className="mt-1 text-xs text-neutral-500">
          Article lives at /{slug || '...'}
          {slug !== article.slug ? ' -- changing this moves the URL and breaks old links to it.' : ''}
        </p>
      </div>

      <div>
        <label htmlFor="excerpt" className={labelClass}>
          Excerpt (optional)
        </label>
        <textarea id="excerpt" name="excerpt" rows={2} className={inputClass} defaultValue={article.excerpt ?? ''} />
      </div>

      <ContentEditor initialValue={article.content} initialFormat="html" />

      <div>
        <label htmlFor="author" className={labelClass}>
          Author
        </label>
        <input
          id="author"
          name="author"
          list="existing-authors"
          placeholder="Author name"
          className={inputClass}
          defaultValue={article.author?.name ?? ''}
        />
        <datalist id="existing-authors">
          {authors.map((author) => (
            <option key={author.id} value={author.name} />
          ))}
        </datalist>
        <p className="mt-1 text-xs text-neutral-500">Existing bylines are reused; a new name creates one.</p>
      </div>

      <div>
        <label className={labelClass}>Featured image</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="featuredImageUrl" className="mb-1 block text-xs text-neutral-600">
              Image URL
            </label>
            <input
              id="featuredImageUrl"
              name="featuredImageUrl"
              type="url"
              placeholder="https://..."
              className={inputClass}
              value={featuredImageUrl}
              onChange={(e) => setFeaturedImageUrl(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="featuredImageAlt" className="mb-1 block text-xs text-neutral-600">
              Image alt text
            </label>
            <input
              id="featuredImageAlt"
              name="featuredImageAlt"
              className={inputClass}
              defaultValue={article.featuredImage?.altText ?? ''}
            />
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <span className="text-xs text-neutral-500">or</span>
          <label className="cursor-pointer border border-neutral-300 px-3 py-1.5 text-xs font-semibold hover:border-red-600 hover:text-red-600">
            {uploading ? 'Uploading…' : 'Upload image'}
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleFileChange} />
          </label>
          {uploadError ? <span className="text-xs text-red-600">{uploadError}</span> : null}
        </div>

        {featuredImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={featuredImageUrl} alt="" className="mt-3 h-32 w-auto border border-neutral-300 object-cover" />
        ) : null}
      </div>

      <GallerySlots
        initial={(article.galleryImages ?? []).map((g) => ({
          mediaId: g.media.id,
          url: g.media.sourceUrl,
          alt: g.media.altText ?? '',
        }))}
      />

      <fieldset className="flex flex-col gap-4 border border-neutral-300 p-3">
        <legend className="px-1 text-sm font-medium">Embeds (optional)</legend>
        <div>
          <label htmlFor="spotifyUrl" className="mb-1 block text-xs text-neutral-600">
            Spotify Link
          </label>
          <input
            id="spotifyUrl"
            name="spotifyUrl"
            type="url"
            placeholder="https://open.spotify.com/track/..."
            className={inputClass}
            defaultValue={article.spotifyUrl ?? ''}
          />
        </div>
        <div>
          <label htmlFor="soundcloudUrl" className="mb-1 block text-xs text-neutral-600">
            SoundCloud Link
          </label>
          <input
            id="soundcloudUrl"
            name="soundcloudUrl"
            type="url"
            placeholder="https://soundcloud.com/artist/track"
            className={inputClass}
            defaultValue={article.soundcloudUrl ?? ''}
          />
        </div>
        <div>
          <label htmlFor="youtubeUrl" className="mb-1 block text-xs text-neutral-600">
            YouTube Link
          </label>
          <input
            id="youtubeUrl"
            name="youtubeUrl"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputClass}
            defaultValue={article.youtubeUrl ?? ''}
          />
        </div>
        <p className="text-xs text-neutral-500">
          Track/video, album/playlist links -- each shows as an embedded player on the article page.
        </p>
      </fieldset>

      <fieldset>
        <legend className={labelClass}>Categories</legend>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 border border-neutral-300 p-3">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="categoryIds"
                value={category.id}
                defaultChecked={initialCategoryIds.includes(category.id)}
                onChange={(e) => {
                  setCheckedCategoryIds((prev) =>
                    e.target.checked ? [...prev, category.id] : prev.filter((id) => id !== category.id)
                  );
                }}
              />
              {category.name}
            </label>
          ))}
        </div>
      </fieldset>

      {checkedCategoryIds.length > 1 ? (
        <div>
          <label htmlFor="primaryCategoryId" className={labelClass}>
            Primary category
          </label>
          <select id="primaryCategoryId" name="primaryCategoryId" className={inputClass} defaultValue={initialPrimaryId ?? undefined}>
            {checkedCategoryIds.map((id) => {
              const category = categories.find((c) => c.id === id);
              return category ? (
                <option key={id} value={id}>
                  {category.name}
                </option>
              ) : null;
            })}
          </select>
        </div>
      ) : null}

      <div>
        <label htmlFor="tags" className={labelClass}>
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          name="tags"
          list="existing-tags"
          placeholder="hip-hop, interviews, 2026"
          className={inputClass}
          defaultValue={(article.articleTags ?? []).map((at) => at.tag.name).join(', ')}
        />
        <datalist id="existing-tags">
          {existingTagNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <p className="mt-1 text-xs text-neutral-500">Existing tags will be reused; anything new gets created.</p>
      </div>

      <p className="text-xs text-neutral-500">
        Featured/homepage placement is managed from the star icons on the Articles list, not here.
      </p>

      <details className="border border-neutral-300 p-3">
        <summary className="cursor-pointer text-sm font-medium">SEO (optional)</summary>
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="seoTitle" className={labelClass}>
              SEO title
            </label>
            <input id="seoTitle" name="seoTitle" className={inputClass} defaultValue={article.seoTitle ?? ''} />
          </div>
          <div>
            <label htmlFor="seoDescription" className={labelClass}>
              SEO description
            </label>
            <textarea
              id="seoDescription"
              name="seoDescription"
              rows={2}
              className={inputClass}
              defaultValue={article.seoDescription ?? ''}
            />
          </div>
          <div>
            <label htmlFor="seoFocusKeyword" className={labelClass}>
              Focus keyword
            </label>
            <input
              id="seoFocusKeyword"
              name="seoFocusKeyword"
              className={inputClass}
              defaultValue={article.seoFocusKeyword ?? ''}
            />
          </div>
        </div>
      </details>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
