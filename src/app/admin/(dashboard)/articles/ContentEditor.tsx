'use client';

import { useMemo, useState } from 'react';
import { marked } from 'marked';

type ContentFormat = 'markdown' | 'html';

function mdToHtml(md: string): string {
  return marked.parse(md, { async: false, gfm: true }) as string;
}

// Loaded lazily inside the handler (not at module scope) since Turndown
// touches DOM APIs (DOMParser) that don't exist during this client
// component's server-side render pass.
async function htmlToMd(html: string): Promise<string> {
  const { default: TurndownService } = await import('turndown');
  return new TurndownService().turndown(html);
}

const tabClass = (active: boolean) =>
  `px-3 py-1 text-xs font-semibold ${active ? 'bg-red-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`;

export function ContentEditor({ initialValue, initialFormat }: { initialValue: string; initialFormat: ContentFormat }) {
  const [format, setFormat] = useState<ContentFormat>(initialFormat);
  const [content, setContent] = useState(initialValue);
  const [converting, setConverting] = useState(false);

  // The form always submits HTML regardless of which tab is active --
  // the stored article content stays a single HTML field, this toggle is
  // purely an authoring convenience.
  const finalHtml = useMemo(() => (format === 'markdown' ? mdToHtml(content) : content), [content, format]);

  async function switchFormat(next: ContentFormat) {
    if (next === format || converting) return;
    if (next === 'html') {
      setContent(mdToHtml(content));
      setFormat('html');
      return;
    }
    setConverting(true);
    try {
      setContent(await htmlToMd(content));
      setFormat('markdown');
    } finally {
      setConverting(false);
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor="content-editor" className="block text-sm font-medium">
          Content
        </label>
        <div className="flex border border-neutral-300">
          <button type="button" onClick={() => switchFormat('markdown')} className={tabClass(format === 'markdown')}>
            Markdown
          </button>
          <button type="button" onClick={() => switchFormat('html')} className={tabClass(format === 'html')}>
            HTML
          </button>
        </div>
      </div>
      <textarea
        id="content-editor"
        required
        rows={16}
        disabled={converting}
        className="w-full border border-neutral-300 px-3 py-2 text-sm font-mono focus:border-red-600 focus:outline-none disabled:opacity-60"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input type="hidden" name="content" value={finalHtml} />
    </div>
  );
}
