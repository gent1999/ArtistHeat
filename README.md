# ArtistHeat

Next.js (App Router) public site + admin panel. Talks to
[ServerHeat](https://github.com/gent1999/ServerHeat) exclusively from the
server (Server Components / Server Functions / `proxy.ts`) -- the browser
never calls the backend directly, so there's no CORS surface and the API
URL never reaches the client bundle.

## Setup

```bash
npm install
cp .env.local.example .env.local   # if present; otherwise see below
npm run dev                        # http://localhost:3000
```

Requires [ServerHeat](https://github.com/gent1999/ServerHeat) running
(see its README for the default port) with its database migrated.

`.env.local`:

```
API_URL=http://localhost:4100
NEXT_PUBLIC_SITE_NAME=ArtistHeat
```

## URL structure

Mirrors the original WordPress permalinks so every existing article URL
and backlink keeps working:

- `/<slug>` -- article (WordPress used `/%postname%/`, flat, no category prefix)
- `/category/<slug>`, `/tag/<slug>`, `/author/<slug>` -- archives
- `/admin` -- admin panel (login at `/admin/login`)

`src/proxy.ts` 301s legacy `/?p=<id>` links and any old (renamed) article
slugs to their current URL, sourced from the `redirects` table the
migration populated.

## Admin panel

Session is a single httpOnly cookie holding the backend's JWT, set by the
`loginAction` Server Function in `src/app/admin/actions.ts`. Currently
just login + a read-only article list (`/admin/articles`) -- article
create/edit forms are the natural next step, calling the backend's
already-built `POST/PUT /api/articles`.

## Known gaps / next steps

- Article images use plain `<img>`, not `next/image` (would need
  `images.remotePatterns` configured for the WordPress upload domain, or
  images rehosted first).
- No pagination UI yet on category/tag/author archives (the API supports
  `?page=`, the pages don't expose it).
- No dark mode -- the site is white by design, not theme-dependent.
- The "Follow ArtistHeat" widget (social follower counts) is intentionally
  left out until real handles/counts are provided -- see `src/lib/social.ts`.
