'use server';

import { redirect } from 'next/navigation';
import { getApiUrl } from '@/lib/api/config';
import { setSession, clearSession, getSession } from './session';
import { NEST_ROUTES } from '@/lib/api/routes';

export async function loginAction(email: string, password: string) {
  const res = await fetch(`${getApiUrl()}${NEST_ROUTES.auth.login}`, {
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

  const { accessToken, refreshToken } = await res.json();
  await setSession(accessToken, refreshToken);
}

export async function logoutAction() {
  // Notifica o backend para invalidar o refresh token no banco
  try {
    const token = await getSession();

    if (token) {
      await fetch(`${getApiUrl()}${NEST_ROUTES.auth.logout}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });
    }
  } catch {
    // Segue o logout local mesmo se o backend falhar
  }

  await clearSession();
  redirect('/login');
}
