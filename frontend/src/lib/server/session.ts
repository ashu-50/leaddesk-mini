import 'server-only';
import type { NextResponse } from 'next/server';
import { serverEnv } from '@/lib/env';

/**
 * The access token is stored in an httpOnly cookie written by the server.
 *
 * Why not localStorage: any script on the page can read localStorage, so a
 * single XSS bug becomes a stolen session. httpOnly + sameSite=lax keeps the
 * token out of JavaScript entirely and still survives a full page reload.
 */
export function setSessionCookie(
  response: NextResponse,
  token: string,
  maxAgeSeconds: number,
): void {
  response.cookies.set({
    name: serverEnv.sessionCookieName,
    value: token,
    httpOnly: true,
    secure: serverEnv.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: serverEnv.sessionCookieName,
    value: '',
    httpOnly: true,
    secure: serverEnv.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
