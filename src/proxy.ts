import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Preserves SEO/backlink value from the old WordPress site: old post
// slugs (renamed at some point) and legacy `/?p=<id>` guid links both get
// 301'd to the article's current URL. The backend only has redirect rows
// for paths that AREN'T a current article slug, so this never intercepts
// a real page -- if lookup misses, the request just falls through to
// normal routing (which serves the page, or 404s on its own).
const API_URL = process.env.API_URL || 'http://localhost:4000';

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  let lookupPath: string;
  if (pathname === '/' && searchParams.has('p')) {
    lookupPath = `/?p=${searchParams.get('p')}`;
  } else {
    lookupPath = pathname.replace(/\/+$/, '') || '/';
  }

  try {
    const res = await fetch(`${API_URL}/api/redirects/lookup?path=${encodeURIComponent(lookupPath)}`);
    if (res.ok) {
      const { redirect } = (await res.json()) as { redirect: { toPath: string; statusCode: number } };
      return NextResponse.redirect(new URL(redirect.toPath, request.url), redirect.statusCode);
    }
  } catch {
    // Backend unreachable -- fall through to normal routing rather than
    // breaking every page load over a redirect-lookup outage.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api|admin|category|tag|author|favicon.ico|robots.txt|sitemap.xml).*)'],
};
