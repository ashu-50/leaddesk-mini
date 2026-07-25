import { NextResponse } from 'next/server';
import { callApi } from '@/lib/server/api';
import { clearSessionCookie } from '@/lib/server/session';

/**
 * POST /api/auth/logout
 *
 * Tells the API (so the event is audited), then clears the cookie regardless
 * of the upstream result — signing out must never fail from the person's side.
 */
export async function POST(): Promise<NextResponse> {
  await callApi('/auth/logout', { method: 'POST', authenticated: true });

  const response = NextResponse.json({
    success: true,
    message: 'Signed out successfully',
    data: null,
  });

  clearSessionCookie(response);

  return response;
}
