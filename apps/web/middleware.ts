import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const token = req.cookies.get('auth_token')?.value;

  // Authenticated user trying to access a public page → redirect to dashboard
  if (isPublic && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Unauthenticated user trying to access a protected route → redirect to login
  if (!isPublic && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Apply middleware to all routes EXCEPT:
     * - _next/static  (static assets)
     * - _next/image   (image optimization)
     * - favicon.ico
     * - /api/*        (proxy routes — auth is handled by Nest)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
