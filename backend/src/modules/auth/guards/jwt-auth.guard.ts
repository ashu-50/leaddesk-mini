import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { JWT_STRATEGY_NAME } from '../auth.constants';
import type { AuthenticatedAdmin } from '../interfaces/jwt-payload.interface';

/**
 * Registered as a global `APP_GUARD`: every route is authenticated by default
 * and must explicitly opt out with `@Public()`. Secure-by-default beats
 * remembering to add a guard to each new controller.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_STRATEGY_NAME) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  override handleRequest<TUser = AuthenticatedAdmin>(err: unknown, user: TUser | false): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Authentication required');
    }

    return user;
  }
}
