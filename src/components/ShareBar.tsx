'use client';

import { useState } from 'react';
import { FacebookIcon, XIcon, PinterestIcon, WhatsAppIcon, LinkIcon } from './icons';

// Real share-intent URLs (no API keys needed), built from the actual
// current page URL. Opened via a click handler rather than a static
// `href` -- computing window.location during render would differ
// between the server-rendered HTML (no window) and the client, causing
// a hydration mismatch.
export function ShareBar({ title, imageUrl }: { title: string; imageUrl?: string | null }) {
  const [copied, setCopied] = useState(false);

  const links = [
    {
      label: 'Facebook',
      Icon: FacebookIcon,
      buildUrl: (pageUrl: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
    },
    {
      label: 'X',
      Icon: XIcon,
      buildUrl: (pageUrl: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`,
    },
    {
      label: 'Pinterest',
      Icon: PinterestIcon,
      buildUrl: (pageUrl: string) =>
        `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}&description=${encodeURIComponent(title)}${
          imageUrl ? `&media=${encodeURIComponent(imageUrl)}` : ''
        }`,
    },
    {
      label: 'WhatsApp',
      Icon: WhatsAppIcon,
      buildUrl: (pageUrl: string) => `https://wa.me/?text=${encodeURIComponent(`${title} ${pageUrl}`)}`,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 bg-neutral-50 p-4">
      <span className="text-xs font-bold uppercase tracking-wide text-neutral-700">Share</span>
      {links.map(({ label, Icon, buildUrl }) => (
        <button
          key={label}
          type="button"
          onClick={() => window.open(buildUrl(window.location.href), '_blank', 'noopener,noreferrer')}
          aria-label={`Share on ${label}`}
          className="flex h-9 w-9 items-center justify-center bg-white text-neutral-700 hover:bg-red-600 hover:text-white"
        >
          <Icon />
        </button>
      ))}
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="flex items-center gap-2 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-neutral-700 hover:bg-red-600 hover:text-white"
      >
        <LinkIcon />
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}
