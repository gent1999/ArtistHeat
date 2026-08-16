'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createArticleAction } from '../../../actions';
import { slugify } from '@/lib/format';
import type { Author, Category } from '@/lib/api';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
    >
      {pending ? 'Publishing…' : 'Publish Article'}
    </button>
  );
}

const inputClass = 'w-full border border-neutral-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium';

export function NewArticleForm({
  authors,
  categories,
  existingTagNames,
}: {
  authors: Author[];
  categories: Category[];
  existingTagNames: string[];
}) {
  const [state, formAction] = useActionState(createArticleAction, undefined);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [checkedCategoryIds, setCheckedCategoryIds] = useState<number[]>([]);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          className={inputClass}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
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
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
        />
        <p className="mt-1 text-xs text-neutral-500">Article will live at /{slug || '...'}</p>
      </div>

      <div>
        <label htmlFor="excerpt" className={labelClass}>
          Excerpt (optional)
        </label>
        <textarea id="excerpt" name="excerpt" rows={2} className={inputClass} />
      </div>

      <div>
        <label htmlFor="content" className={labelClass}>
          Content (HTML)
        </label>
        <textarea id="content" name="content" required rows={16} className={`${inputClass} font-mono`} />
      </div>

      <div>
        <label htmlFor="author" className={labelClass}>
          Author
        </label>
        <input id="author" name="author" list="existing-authors" placeholder="Author name" className={inputClass} />
        <datalist id="existing-authors">
          {authors.map((author) => (
            <option key={author.id} value={author.name} />
          ))}
        </datalist>
        <p className="mt-1 text-xs text-neutral-500">Existing bylines are reused; a new name creates one.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="featuredImageUrl" className={labelClass}>
            Featured image URL
          </label>
          <input id="featuredImageUrl" name="featuredImageUrl" type="url" placeholder="https://..." className={inputClass} />
        </div>
        <div>
          <label htmlFor="featuredImageAlt" className={labelClass}>
            Image alt text
          </label>
          <input id="featuredImageAlt" name="featuredImageAlt" className={inputClass} />
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>Categories</legend>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 border border-neutral-300 p-3">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="categoryIds"
                value={category.id}
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
          <select id="primaryCategoryId" name="primaryCategoryId" className={inputClass}>
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
        <input id="tags" name="tags" list="existing-tags" placeholder="hip-hop, interviews, 2026" className={inputClass} />
        <datalist id="existing-tags">
          {existingTagNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <p className="mt-1 text-xs text-neutral-500">Existing tags will be reused; anything new gets created.</p>
      </div>

      <div className="flex items-center gap-6 border border-neutral-300 p-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="isFeatured" />
          Feature on homepage
        </label>
        <div className="flex items-center gap-2">
          <label htmlFor="featuredOrder" className="text-sm text-neutral-600">
            Order
          </label>
          <input id="featuredOrder" name="featuredOrder" type="number" min={1} className="w-20 border border-neutral-300 px-2 py-1 text-sm" />
        </div>
      </div>

      <details className="border border-neutral-300 p-3">
        <summary className="cursor-pointer text-sm font-medium">SEO (optional)</summary>
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="seoTitle" className={labelClass}>
              SEO title
            </label>
            <input id="seoTitle" name="seoTitle" className={inputClass} />
          </div>
          <div>
            <label htmlFor="seoDescription" className={labelClass}>
              SEO description
            </label>
            <textarea id="seoDescription" name="seoDescription" rows={2} className={inputClass} />
          </div>
          <div>
            <label htmlFor="seoFocusKeyword" className={labelClass}>
              Focus keyword
            </label>
            <input id="seoFocusKeyword" name="seoFocusKeyword" className={inputClass} />
          </div>
        </div>
      </details>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
