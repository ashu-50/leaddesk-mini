import 'server-only';
import { NextResponse } from 'next/server';
import { clearSessionCookie } from './session';
import type { ServerApiResult } from './api';

/**
 * Turns an upstream API result into the response this app sends back to the
 * browser, preserving the envelope and the status code.
 *
 * A 401 from upstream also drops the local cookie, so a token that expired
 * server-side can never leave the client believing it is still signed in.
 */
export function forwardResponse<T>(result: ServerApiResult<T>): NextResponse {
  const response = NextResponse.json(result.payload, { status: result.status });

  if (result.status === 401) {
    clearSessionCookie(response);
  }

  return response;
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
