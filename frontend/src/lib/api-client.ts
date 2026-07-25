import { ApiError } from './api-error';
import type { ApiResponse } from '@/types/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  searchParams?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
}

function buildUrl(path: string, searchParams?: RequestOptions['searchParams']): string {
  if (!searchParams) {
    return path;
  }

  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  }

  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

/**
 * The browser's only door to the outside world.
 *
 * It talks to this app's own `/api/*` route handlers — never to the NestJS
 * origin — and turns the standard envelope into either data or an `ApiError`.
 */
export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, searchParams, signal } = options;

  let response: Response;

  try {
    response = await fetch(buildUrl(path, searchParams), {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload || payload.success === false) {
    const message = payload && !payload.success ? payload.message : 'Something went wrong';
    const errors = payload && !payload.success ? payload.errors : [];
    throw new ApiError(message, response.status, errors);
  }

  return payload.data;
}
