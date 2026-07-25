import type { AdminRole } from '@prisma/client';

/** Claims stored inside the signed access token. */
export interface JwtPayload {
  /** Subject — the admin id. */
  sub: string;
  email: string;
  role: AdminRole;
}

/** The value attached to `request.user` after the JWT strategy validates. */
export interface AuthenticatedAdmin {
  id: string;
  email: string;
  role: AdminRole;
}
