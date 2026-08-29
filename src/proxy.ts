import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const WWW_HOST = 'www.artistheat.com';
const APEX_HOST = 'artistheat.com';

// Paths the WP-redirect lookup below never needs to run for -- kept as an
// explicit list (rather than folded into the matcher) now that the
// matcher also has to cover these paths for the www redirect.
const REDIRECT_LOOKUP_EXCLUDED = ['/api', '/admin', '/category', '/tag', '/author'];
function skipsRedirectLookup(pathname: string): boolean {
  if (pathname === '/robots.txt' || pathname === '/sitemap.xml') return true;
  return REDIRECT_LOOKUP_EXCLUDED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Canonical host: www.artistheat.com -> artistheat.com, preserving the
  // full path and query string. Runs before anything else, on every path.
  const host = request.headers.get('host');
  if (host === WWW_HOST) {
    const canonicalUrl = new URL(request.url);
    canonicalUrl.hostname = APEX_HOST;
    return NextResponse.redirect(canonicalUrl, 308);
  }

  if (skipsRedirectLookup(pathname)) {
    return NextResponse.next();
  }

  // Preserves SEO/backlink value from the old WordPress site: old post
  // slugs (renamed at some point) and legacy `/?p=<id>` guid links both get
  // 301'd to the article's current URL. The backend only has redirect rows
  // for paths that AREN'T a current article slug, so this never intercepts
  // a real page -- if lookup misses, the request just falls through to
  // normal routing (which serves the page, or 404s on its own).
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
