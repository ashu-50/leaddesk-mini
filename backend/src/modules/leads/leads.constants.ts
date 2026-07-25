import type { LeadStatus } from '@prisma/client';

/**
 * The public capture endpoint is the only unauthenticated write in the system,
 * so it gets its own hard limit independent of the global one.
 */
export const PUBLIC_LEAD_RATE_LIMIT = {
  ttl: 60_000,
  limit: 10,
} as const;

/**
 * Which moves the lifecycle permits.
 *
 * Everything can go forward, and a mis-click can be walked back one step. The
 * one move that is refused is CLOSED → NEW: "new" means nobody has replied
 * yet, so reopening a finished lead that way would quietly inflate every
 * "waiting on you" figure on the dashboard. Reopen to CONTACTED instead.
 */
export const ALLOWED_STATUS_TRANSITIONS: Readonly<Record<LeadStatus, readonly LeadStatus[]>> = {
  NEW: ['CONTACTED', 'CLOSED'],
  CONTACTED: ['NEW', 'CLOSED'],
  CLOSED: ['CONTACTED'],
} as const;
