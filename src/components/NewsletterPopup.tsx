'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { subscribeNewsletterAction } from '@/app/actions';

// Ported from Cry808's NewsletterPopup.jsx. Two localStorage keys control
// whether this ever shows again: `nl_subscribed` is set permanently on a
// successful subscribe (never shown again, on any device/session sharing
// that browser storage), `nl_dismissed_until` is set to now + 7 days when
// closed (shown again once that date passes). Both triggers (timer, scroll)
// share one `triggered` ref so whichever fires first wins and the other is
// a no-op.
const STORAGE_KEY_SUBSCRIBED = 'nl_subscribed';
const STORAGE_KEY_DISMISSED = 'nl_dismissed_until';
const DISMISS_DAYS = 7;
const SHOW_DELAY_MS = 20_000;
const SCROLL_THRESHOLD = 0.5;
const SUCCESS_AUTOHIDE_MS = 2800;

function JoinButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-red-600 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700 disabled:opacity-60"
    >
      {pending ? 'Joining…' : 'Join the Loop'}
    </button>
  );
}

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const triggered = useRef(false);
  const [state, formAction] = useActionState(subscribeNewsletterAction, undefined);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY_SUBSCRIBED)) return;
    const dismissedUntil = localStorage.getItem(STORAGE_KEY_DISMISSED);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;

    const show = () => {
      if (!triggered.current) {
        triggered.current = true;
        setVisible(true);
      }
    };

    const timer = setTimeout(show, SHOW_DELAY_MS);

    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled / total >= SCROLL_THRESHOLD) show();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!state?.success) return;
    localStorage.setItem(STORAGE_KEY_SUBSCRIBED, '1');
    const hide = setTimeout(() => setVisible(false), SUCCESS_AUTOHIDE_MS);
    return () => clearTimeout(hide);
  }, [state]);

  function dismiss() {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY_DISMISSED, String(until));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md border border-neutral-800 bg-neutral-950">
        <div className="h-[3px] bg-red-600" />

        <div className="p-8 sm:p-10">
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-4 right-4 text-xl leading-none text-white/30 transition-colors hover:text-white/70"
          >
            &times;
          </button>

          {state?.success ? (
            <div className="py-4 text-center">
              <h3 className="mb-2 text-xl font-black uppercase tracking-wide text-white">You&rsquo;re In</h3>
              <p className="text-sm text-white/50">Welcome to the loop. Check your inbox.</p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-red-600">Newsletter</p>
              <h2 className="mb-4 text-2xl leading-none font-black tracking-tight text-white uppercase sm:text-3xl">
                Stay On
                <br />
                The Heat
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-white/45">
                Underground artists, exclusive interviews, and new drops straight to your inbox.
              </p>

              <form action={formAction} className="flex flex-col gap-3">
                <input type="hidden" name="source" value="popup" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none"
                />
                {state?.error ? <p className="text-xs text-red-400">{state.error}</p> : null}
                <JoinButton />
              </form>

              <p className="mt-5 text-center text-xs text-white/20">No spam. Unsubscribe anytime.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
