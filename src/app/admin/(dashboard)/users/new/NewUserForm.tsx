'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createUserAction } from '../../../actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
    >
      {pending ? 'Creating…' : 'Create Account'}
    </button>
  );
}

const inputClass = 'w-full border border-neutral-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium';

export function NewUserForm() {
  const [state, formAction] = useActionState(createUserAction, undefined);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-6">
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input id="name" name="name" required className={inputClass} />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input id="password" name="password" type="password" required minLength={8} className={inputClass} />
        <p className="mt-1 text-xs text-neutral-500">At least 8 characters.</p>
      </div>

      <div>
        <label htmlFor="role" className={labelClass}>
          Tier
        </label>
        <select id="role" name="role" defaultValue="editor" className={inputClass}>
          <option value="editor">Editor -- dashboard, new article, articles list only</option>
          <option value="admin">Admin -- full access</option>
        </select>
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
