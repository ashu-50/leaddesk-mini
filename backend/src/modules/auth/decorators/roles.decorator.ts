import { SetMetadata } from '@nestjs/common';
import type { CustomDecorator } from '@nestjs/common';
import type { AdminRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Authorisation: restricts a route to the listed admin roles. */
export const Roles = (...roles: AdminRole[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);
