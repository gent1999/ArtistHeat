'use server';

// Public (non-admin) server actions -- admin/actions.ts is for admin-only
// mutations that require a session token; this file is for actions any
// site visitor can trigger.

import { ApiError, api } from '@/lib/api';

export async function subscribeNewsletterAction(
  _prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  const email = String(formData.get('email') || '').trim();
  const source = String(formData.get('source') || 'homepage_widget');

  try {
    const { message } = await api.subscribeNewsletter(email, source);
    return { success: message };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Something went wrong. Please try again.' };
  }
}
