import { NextResponse } from 'next/server';
import { callApi } from '@/lib/server/api';
import { readJsonBody } from '@/lib/server/proxy';
import { setSessionCookie } from '@/lib/server/session';
import type { AdminProfile } from '@/types/auth';

interface LoginApiData {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  admin: AdminProfile;
}

/**
 * POST /api/auth/login
 *
 * Exchanges credentials for a token upstream, stores that token in an httpOnly
 * cookie, and returns only the admin profile. The token itself never reaches
 * client-side JavaScript.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = await readJsonBody(request);
  const result = await callApi<LoginApiData>('/auth/login', { method: 'POST', body });

  if (!result.payload.success) {
    return NextResponse.json(result.payload, { status: result.status });
  }

  const { accessToken, expiresIn, admin } = result.payload.data;

  const response = NextResponse.json(
    { success: true, message: result.payload.message, data: { admin } },
    { status: 200 },
  );

  setSessionCookie(response, accessToken, expiresIn);

  return response;
}
