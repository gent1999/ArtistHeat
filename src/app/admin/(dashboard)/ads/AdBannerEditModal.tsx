'use client';

import { startTransition, useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import type { AdBanner } from '@/lib/api';
import { updateAdBannerDetailsAction } from '../../actions';
import { uploadImageToCloudinary } from '@/lib/upload';

const inputClass = 'w-full border border-neutral-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium';

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
    >
      {pending ? 'Saving…' : 'Save Changes'}
    </button>
  );
}

export function AdBannerEditModal({ ad }: { ad: AdBanner }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const boundAction = updateAdBannerDetailsAction.bind(null, ad.id);
  const [state, formAction] = useActionState(boundAction, undefined);

  const [imageUrl, setImageUrl] = useState(ad.imageUrl);
  const [linkUrl, setLinkUrl] = useState(ad.linkUrl);
  const [title, setTitle] = useState(ad.title ?? '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Re-sync whenever the modal is reopened, in case the row's data changed
  // since the last time it was open (e.g. after a reorder/refresh).
  useEffect(() => {
    if (open) {
      setImageUrl(ad.imageUrl);
      setLinkUrl(ad.linkUrl);
      setTitle(ad.title ?? '');
      setUploadError(null);
    }
  }, [open, ad.imageUrl, ad.linkUrl, ad.title]);

  useEffect(() => {
    if (state && !state.error) {
      startTransition(() => setOpen(false));
      router.refresh();
    }
  }, [state, router]);

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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border border-neutral-300 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-600 hover:border-red-600 hover:text-red-600"
      >
        Edit
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto border border-neutral-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit Ad</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-neutral-400 hover:text-red-600"
              >
                Close
              </button>
            </div>

            <form action={formAction} className="flex flex-col gap-4">
              <input type="hidden" name="imageUrl" value={imageUrl} />

              <div>
                <label className={labelClass}>Banner Image</label>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="mb-3 h-32 w-full border border-neutral-200 object-cover" />
                <label className="block w-full cursor-pointer border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500 hover:border-red-600 hover:text-red-600">
                  {uploading ? 'Uploading…' : 'Swap Image'}
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
                {uploadError ? <p className="mt-2 text-xs text-red-600">{uploadError}</p> : null}
              </div>

              <div>
                <label htmlFor={`edit-link-${ad.id}`} className={labelClass}>
                  Destination URL
                </label>
                <input
                  id={`edit-link-${ad.id}`}
                  name="linkUrl"
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={`edit-title-${ad.id}`} className={labelClass}>
                  Caption <span className="font-normal text-neutral-400">(optional)</span>
                </label>
                <input
                  id={`edit-title-${ad.id}`}
                  name="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                />
              </div>

              {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
              <SubmitButton disabled={!canSubmit} />
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
