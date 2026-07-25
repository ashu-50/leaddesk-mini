import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AdminRole } from '@prisma/client';
import type { RequestWithId } from '../../../common/interfaces/request-with-id.interface';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AuthenticatedAdmin } from '../interfaces/jwt-payload.interface';

/**
 * Authorisation layer. Runs after `JwtAuthGuard`, so `request.user` is
 * guaranteed to exist for any route that declares `@Roles(...)`.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<RequestWithId & { user?: AuthenticatedAdmin }>();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }

    return true;
  }
}
