import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const WWW_HOST = 'www.artistheat.com';
const APEX_HOST = 'artistheat.com';

// Legacy WordPress slug redirects (old post slug -> current article URL) are
// resolved by [slug]/page.tsx itself, only when an article actually 404s --
// see loadArticle's notFound fallback there. That keeps this proxy free of a
// backend round trip on every normal pageview (every article, every static
// page, every asset-adjacent route) instead of paying for one on every
// single request just to catch the rare renamed-slug case.
//
// The one redirect case still handled here is the legacy `/?p=<id>` guid
// link format, which points at `/` rather than a slug path, so there's no
// [slug] route 404 to hook into -- it only ever fires for that narrow shape.
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

  if (pathname === '/' && searchParams.has('p')) {
    const lookupPath = `/?p=${searchParams.get('p')}`;
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
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
