'use server';

import { redirect } from 'next/navigation';
import { ApiError, api } from '@/lib/api';
import { clearSessionToken, setSessionToken } from '@/lib/session';

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');

  try {
    const { token } = await api.login(email, password);
    await setSessionToken(token);
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: err.status === 401 ? 'Invalid email or password' : err.message };
    }
    return { error: 'Something went wrong. Try again.' };
  }

  redirect('/admin');
}

export async function logoutAction() {
  await clearSessionToken();
  redirect('/admin/login');
}
