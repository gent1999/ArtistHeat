'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { subscribeNewsletterAction } from '@/app/actions';

function SubscribeButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-between bg-red-600 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors duration-150 hover:bg-red-700 disabled:opacity-60"
    >
      {pending ? 'Subscribing…' : 'Subscribe'}
      <span aria-hidden="true">&rarr;</span>
    </button>
  );
}

export function NewsletterWidget() {
  const [state, formAction] = useActionState(subscribeNewsletterAction, undefined);

  return (
    <div className="relative bg-[url('/newsletter-background2.png')] bg-cover bg-center bg-no-repeat">
      <div className="pointer-events-none absolute inset-0 bg-black/65" />
      <div className="relative z-10 p-5">
        <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-white">
          <span className="text-red-600">{'///'}</span> Stay in the Loop
        </h2>
        <p className="mb-4 text-sm text-neutral-300">
          Get the latest music news, interviews, artist drops and more, straight to your inbox.
        </p>
        <form action={formAction} className="flex flex-col gap-2">
          <input
            name="email"
            type="email"
            required
            placeholder="Your email address"
            className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-500"
          />
          <SubscribeButton />
        </form>
        {state?.success ? <p className="mt-2 text-xs text-emerald-400">{state.success}</p> : null}
        {state?.error ? <p className="mt-2 text-xs text-red-400">{state.error}</p> : null}
        <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-neutral-400">
          New music. Next up. Always on heat.
        </p>
      </div>
    </div>
  );
}
