'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createAdBannerAction } from '../../actions';
import { uploadImageToCloudinary } from '@/lib/upload';

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
    >
      {pending ? 'Saving…' : 'Create Ad'}
    </button>
  );
}

export function AdBannerForm() {
  const [state, formAction] = useActionState(createAdBannerAction, undefined);
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadImageToCloudinary(file);
      setImageUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  const canSubmit = Boolean(imageUrl && linkUrl.trim() && !uploading);

  // Only clears the form after a successful create (state is defined with no
  // error) -- a validation failure leaves the admin's input in place instead
  // of silently discarding what they just typed/uploaded.
  useEffect(() => {
    if (state && !state.error) {
      setImageUrl('');
      setLinkUrl('');
      setTitle('');
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-6 border border-neutral-200 p-5">
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <div>
        <label className="mb-1 block text-sm font-medium">
          Banner Image <span className="text-red-600">*</span>
        </label>
        <label className="block w-full cursor-pointer border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 hover:border-red-600 hover:text-red-600">
          {uploading ? 'Uploading…' : imageUrl ? 'Change Image' : 'Upload a banner image (JPG or PNG)'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) handleFile(file);
            }}
          />
        </label>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="mt-3 h-40 w-full border border-neutral-200 object-cover" />
        ) : null}
        {uploadError ? <p className="mt-2 text-xs text-red-600">{uploadError}</p> : null}
      </div>

      <div>
        <label htmlFor="linkUrl" className="mb-1 block text-sm font-medium">
          Destination URL <span className="text-red-600">*</span>
        </label>
        <input
          id="linkUrl"
          name="linkUrl"
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://example.com/landing-page"
          className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Caption <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short line shown under the banner"
          className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
        />
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton disabled={!canSubmit} />
    </form>
  );
}
