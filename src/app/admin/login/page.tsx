'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-neutral-900 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-60"
    >
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useActionState(loginAction, undefined);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold">Admin sign in</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        <SubmitButton />
      </form>
    </div>
  );
}
