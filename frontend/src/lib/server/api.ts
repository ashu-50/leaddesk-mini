import 'server-only';
import { cookies } from 'next/headers';
import { serverEnv } from '@/lib/env';
import type { ApiResponse } from '@/types/api';

interface ServerRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Attach the session token from the httpOnly cookie. */
  authenticated?: boolean;
  searchParams?: URLSearchParams;
  /** Forwarded so a request can be traced across both services. */
  requestId?: string;
}

export interface ServerApiResult<T> {
  status: number;
  payload: ApiResponse<T>;
}

const UNREACHABLE: ApiResponse<never> = {
  success: false,
  message: 'The API is unavailable right now. Please try again shortly.',
  statusCode: 503,
  errors: [],
  path: '',
  timestamp: '',
  requestId: '',
};

export async function readSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(serverEnv.sessionCookieName)?.value;
}

/**
 * Server-to-server call into the NestJS API.
 *
 * Runs only in route handlers and server components, so the access token is
 * read from the httpOnly cookie and attached here — it is never serialised
 * into any HTML or JavaScript sent to the browser.
 */
export async function callApi<T>(
  path: string,
  options: ServerRequestOptions = {},
): Promise<ServerApiResult<T>> {
  const { method = 'GET', body, authenticated = false, searchParams, requestId } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (requestId) {
    headers['X-Request-Id'] = requestId;
  }

  if (authenticated) {
    const token = await readSessionToken();

    if (!token) {
      return {
        status: 401,
        payload: {
          success: false,
          message: 'Your session has expired. Sign in again.',
          statusCode: 401,
          errors: [],
          path,
          timestamp: new Date().toISOString(),
          requestId: requestId ?? '',
        },
      };
    }

    headers.Authorization = `Bearer ${token}`;
  }

  const query = searchParams?.toString();
  const url = `${serverEnv.apiBaseUrl}${path}${query ? `?${query}` : ''}`;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });

    const payload = (await response.json()) as ApiResponse<T>;
    return { status: response.status, payload };
  } catch {
    return { status: 503, payload: UNREACHABLE };
  }
}
