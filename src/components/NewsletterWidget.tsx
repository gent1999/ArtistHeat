'use client';

import { useState } from 'react';

// UI only for now -- there's no subscriber storage/email service wired up
// yet, so submitting says so explicitly rather than pretending to succeed.
export function NewsletterWidget() {
  const [message, setMessage] = useState<string | null>(null);

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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setMessage("Signups aren't set up yet -- check back soon.");
          }}
          className="flex flex-col gap-2"
        >
          <input
            type="email"
            required
            placeholder="Your email address"
            className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-500"
          />
          <button
            type="submit"
            className="flex w-full items-center justify-between bg-red-600 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors duration-150 hover:bg-red-700"
          >
            Subscribe
            <span aria-hidden="true">&rarr;</span>
          </button>
        </form>
        {message ? <p className="mt-2 text-xs text-neutral-300">{message}</p> : null}
        <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-neutral-400">
          New music. Next up. Always on heat.
        </p>
      </div>
    </div>
  );
}
