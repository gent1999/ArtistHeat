'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUserAction } from '../../../../actions';
import { uploadImageToCloudinary } from '@/lib/upload';
import type { AdminAccount } from '@/lib/api';

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

export function EditUserForm({ user, isSelf }: { user: AdminAccount; isSelf: boolean }) {
  const updateWithId = updateUserAction.bind(null, user.id, user.authorId);
  const [state, formAction] = useActionState(updateWithId, undefined);

  const [avatarUrl, setAvatarUrl] = useState(user.author?.avatarUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadImageToCloudinary(file);
      setAvatarUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-6">
      <input type="hidden" name="avatarUrl" value={avatarUrl} />

      <div>
        <label className={labelClass}>
          Profile Picture <span className="font-normal text-neutral-400">(shown as this person's author photo)</span>
        </label>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-16 w-16 shrink-0 rounded-full border border-neutral-200 object-cover" />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs text-neutral-400">
              None
            </span>
          )}
          <div className="flex flex-col gap-2">
            <label className="block cursor-pointer border border-dashed border-neutral-300 px-4 py-2 text-center text-sm text-neutral-500 hover:border-red-600 hover:text-red-600">
              {uploading ? 'Uploading…' : avatarUrl ? 'Change Photo' : 'Upload a Photo'}
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
            {avatarUrl ? (
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                className="text-xs font-semibold text-neutral-500 hover:text-red-600"
              >
                Remove Photo
              </button>
            ) : null}
          </div>
        </div>
        {uploadError ? <p className="mt-2 text-xs text-red-600">{uploadError}</p> : null}
      </div>
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input id="name" name="name" required className={inputClass} defaultValue={user.name} />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputClass} defaultValue={user.email} />
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          New password (optional)
        </label>
        <input id="password" name="password" type="password" minLength={8} className={inputClass} />
        <p className="mt-1 text-xs text-neutral-500">Leave blank to keep the current password.</p>
      </div>

      <div>
        <label htmlFor="role" className={labelClass}>
          Tier
        </label>
        <select id="role" name="role" defaultValue={user.role} className={inputClass}>
          <option value="editor">Editor -- dashboard, new article, articles list only</option>
          <option value="admin">Admin -- full access</option>
        </select>
        {isSelf ? <p className="mt-1 text-xs text-neutral-500">This is your own account.</p> : null}
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
