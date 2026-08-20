'use client';

import { useState } from 'react';
import { uploadImageToCloudinary } from '@/lib/upload';

export type GallerySlotValue = { mediaId: number; url: string; alt: string };

const SLOT_COUNT = 3;

export function GallerySlots({ initial }: { initial: GallerySlotValue[] }) {
  const original = [0, 1, 2].map((i) => initial[i] ?? null);
  const [slots, setSlots] = useState<{ url: string; alt: string }[]>(
    original.map((s) => ({ url: s?.url ?? '', alt: s?.alt ?? '' }))
  );
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateSlot(i: number, patch: Partial<{ url: string; alt: string }>) {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  async function handleFile(i: number, file: File) {
    setUploadingSlot(i);
    setError(null);
    try {
      const url = await uploadImageToCloudinary(file);
      updateSlot(i, { url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingSlot(null);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">Additional Photos (up to {SLOT_COUNT})</label>
      <p className="mb-2 text-xs text-neutral-500">Shown at the bottom of the article, below the featured image.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {slots.map((slot, i) => (
          <div key={i} className="border border-neutral-300 p-3">
            <input type="hidden" name={`originalGalleryMediaId${i}`} value={original[i]?.mediaId ?? ''} />
            <input type="hidden" name={`originalGalleryUrl${i}`} value={original[i]?.url ?? ''} />
            <input type="hidden" name={`galleryImageUrl${i}`} value={slot.url} />
            <input type="hidden" name={`galleryImageAlt${i}`} value={slot.alt} />

            <input
              type="url"
              placeholder="Image URL"
              value={slot.url}
              onChange={(e) => updateSlot(i, { url: e.target.value })}
              className="mb-2 w-full border border-neutral-300 px-2 py-1 text-xs focus:border-red-600 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Alt text"
              value={slot.alt}
              onChange={(e) => updateSlot(i, { alt: e.target.value })}
              className="mb-2 w-full border border-neutral-300 px-2 py-1 text-xs focus:border-red-600 focus:outline-none"
            />
            <label className="block cursor-pointer border border-neutral-300 px-2 py-1 text-center text-xs font-semibold hover:border-red-600 hover:text-red-600">
              {uploadingSlot === i ? 'Uploading…' : 'Upload'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingSlot !== null}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) handleFile(i, file);
                }}
              />
            </label>

            {slot.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slot.url} alt="" className="mt-2 h-20 w-full border border-neutral-200 object-cover" />
            ) : null}
          </div>
        ))}
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
