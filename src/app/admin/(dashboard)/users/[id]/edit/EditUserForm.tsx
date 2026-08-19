'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUserAction } from '../../../../actions';
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
  const updateWithId = updateUserAction.bind(null, user.id);
  const [state, formAction] = useActionState(updateWithId, undefined);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-6">
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
