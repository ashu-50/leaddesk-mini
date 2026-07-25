import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'leaddesk_session';
const LOGIN_PATH = '/admin/login';
const DASHBOARD_PATH = '/admin';

/**
 * Edge-level routing for the admin area.
 *
 * This is a *fast path*, not the security boundary: it only checks that a
 * session cookie exists, so an unauthenticated visitor never sees a dashboard
 * skeleton flash before being redirected. The real check happens upstream,
 * where every admin request is verified against the JWT signature and the
 * database — see `app/admin/(protected)/layout.tsx` and the NestJS guards.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (pathname === LOGIN_PATH) {
    if (hasSession) {
      return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
    }

    return NextResponse.next();
  }

  if (!hasSession) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
