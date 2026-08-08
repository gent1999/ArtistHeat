'use client';

import { useState } from 'react';

// UI only for now -- there's no subscriber storage/email service wired up
// yet, so submitting says so explicitly rather than pretending to succeed.
export function NewsletterWidget() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="border border-neutral-200 p-5">
      <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide">Stay in the Loop</h2>
      <p className="mb-4 text-sm text-neutral-600">
        Get the latest entertainment news and stories delivered straight to your inbox.
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
          className="w-full border border-neutral-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="w-full bg-red-600 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-red-700">
          Subscribe
        </button>
      </form>
      {message ? <p className="mt-2 text-xs text-neutral-500">{message}</p> : null}
    </div>
  );
}
