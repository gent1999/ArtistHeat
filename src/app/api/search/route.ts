import { NextRequest } from 'next/server';
import { api } from '@/lib/api';

// Thin same-origin proxy so the live-as-you-type search dropdown (a client
// component) can hit something without talking to the backend directly --
// api.ts is server-only by design (no CORS surface, API_URL never ships to
// the browser). This just forwards to the same ?q= search the /search page
// uses, capped small since it's a dropdown preview, not the full results page.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!q) return Response.json({ articles: [] });

  const { articles } = await api.listArticles({ q, pageSize: 6 });
  return Response.json({ articles });
}
