import 'server-only';

/**
 * Server-side configuration.
 *
 * `API_BASE_URL` is intentionally *not* a `NEXT_PUBLIC_` variable: the browser
 * never talks to the NestJS API directly. Every call is proxied by a route
 * handler, which is what lets the session token live in an httpOnly cookie.
 */
function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `Missing environment variable "${name}". Copy .env.example to .env.local and fill it in.`,
    );
  }

  return value;
}

export const serverEnv = {
  apiBaseUrl: required('API_BASE_URL', process.env.API_BASE_URL).replace(/\/$/, ''),
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? 'leaddesk_session',
  isProduction: process.env.NODE_ENV === 'production',
} as const;
