'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { sendNewsletterAction } from '../../actions';
import { uploadImageToCloudinary } from '@/lib/upload';

function SendButtons({ canSend, activeCount }: { canSend: boolean; activeCount: number }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="submit"
        name="isTest"
        value="on"
        disabled={!canSend || pending}
        className="border border-amber-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-700 hover:bg-amber-50 disabled:opacity-40"
      >
        {pending ? 'Sending…' : 'Send Test Email'}
      </button>
      <button
        type="submit"
        name="isTest"
        value="off"
        disabled={!canSend || pending}
        onClick={(e) => {
          if (
            !window.confirm(
              `This will send the newsletter to all ${activeCount} active subscriber${activeCount === 1 ? '' : 's'}.\n\nAre you sure?`
            )
          ) {
            e.preventDefault();
          }
        }}
        className="bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-red-700 disabled:opacity-40"
      >
        {pending ? 'Sending…' : `Send to All ${activeCount} Subscriber${activeCount === 1 ? '' : 's'}`}
      </button>
    </div>
  );
}

export function NewsletterComposeForm({ activeCount }: { activeCount: number }) {
  const [state, formAction] = useActionState(sendNewsletterAction, undefined);
  const [subject, setSubject] = useState('');
  const [introText, setIntroText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
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

  const canSend = Boolean(subject.trim() && imageUrl && !uploading);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <div>
        <label className="mb-1 block text-sm font-medium">Cover Image</label>
        <label className="block w-full cursor-pointer border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 hover:border-red-600 hover:text-red-600">
          {uploading ? 'Uploading…' : imageUrl ? 'Change Image' : 'Upload a cover image (JPG or PNG)'}
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
        <label htmlFor="subject" className="mb-1 block text-sm font-medium">
          Subject Line
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. ArtistHeat Weekly — This Week's Heat"
          className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="introText" className="mb-1 block text-sm font-medium">
          Intro Text <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <textarea
          id="introText"
          name="introText"
          rows={4}
          value={introText}
          onChange={(e) => setIntroText(e.target.value)}
          placeholder="Short message shown above the cover image."
          className="w-full resize-none border border-neutral-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
        />
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? (
        <div className="border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.success}
          {state.errors?.length ? (
            <p className="mt-1 text-xs text-amber-700">Failed: {state.errors.map((e) => e.email).join(', ')}</p>
          ) : null}
        </div>
      ) : null}

      <SendButtons canSend={canSend} activeCount={activeCount} />
    </form>
  );
}
