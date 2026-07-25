/**
 * Login is brute-force bait, so its rate limit is a hard constant rather than
 * an environment variable: a misconfigured deployment must not be able to
 * widen it. The global limit stays env-driven.
 */
export const LOGIN_RATE_LIMIT = {
  ttl: 60_000,
  limit: 5,
} as const;

export const JWT_STRATEGY_NAME = 'jwt';

/** Signed into every token and verified on every request. */
export const JWT_ISSUER = 'leaddesk-mini';
