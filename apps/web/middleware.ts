import { NextResponse, type NextRequest } from 'next/server';
import { getLocaleFromRequest, LOCALE_COOKIE } from './lib/i18n';

const PUBLIC_PATHS = ['/login'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const token = req.cookies.get('auth_token')?.value;

  if (isPublic && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const response = NextResponse.next();

  if (!req.cookies.get(LOCALE_COOKIE)) {
    const locale = getLocaleFromRequest(req);
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)',],
};
