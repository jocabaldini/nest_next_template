'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getApiUrl } from '@/lib/api/config';
import { setSession } from './session';

export async function loginAction(email: string, password: string) {
  const res = await fetch(`${getApiUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.message ?? 'Credenciais inválidas';
    throw new Error(message);
  }

  const { accessToken } = await res.json();
  await setSession(accessToken);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/login');
}
