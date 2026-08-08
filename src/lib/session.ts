import { cookies } from 'next/headers';

const SESSION_COOKIE = 'artistheat_admin_token';

// The admin JWT lives only in an httpOnly cookie on the Next.js origin.
// The browser never sees it or calls the backend directly -- every admin
// API call is made server-side (Server Component / Server Function),
// which reads this cookie and attaches it as a Bearer token.
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionToken(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days, matches backend JWT_EXPIRES_IN default
  });
}

export async function clearSessionToken() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
