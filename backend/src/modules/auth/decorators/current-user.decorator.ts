import { createParamDecorator } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { RequestWithId } from '../../../common/interfaces/request-with-id.interface';
import type { AuthenticatedAdmin } from '../interfaces/jwt-payload.interface';

/**
 * Injects the authenticated admin into a handler:
 * `findAll(@CurrentUser() admin: AuthenticatedAdmin)`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedAdmin => {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithId & { user: AuthenticatedAdmin }>();
    return request.user;
  },
);
