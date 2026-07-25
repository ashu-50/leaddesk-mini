import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';
import type { AuthenticatedAdmin } from '../interfaces/jwt-payload.interface';

const createContext = (user?: AuthenticatedAdmin): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => undefined,
    getClass: () => undefined,
  }) as unknown as ExecutionContext;

const admin: AuthenticatedAdmin = {
  id: '5b6d7e8f-1a2b-4c3d-9e0f-1a2b3c4d5e6f',
  email: 'admin@leaddesk.dev',
  role: AdminRole.ADMIN,
};

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('allows routes that declare no roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(createContext(admin))).toBe(true);
  });

  it('allows an admin holding a required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([AdminRole.ADMIN]);

    expect(guard.canActivate(createContext(admin))).toBe(true);
  });

  it('blocks an admin without the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([AdminRole.SUPER_ADMIN]);

    expect(() => guard.canActivate(createContext(admin))).toThrow(ForbiddenException);
  });

  it('blocks an unauthenticated request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([AdminRole.ADMIN]);

    expect(() => guard.canActivate(createContext())).toThrow(ForbiddenException);
  });
});
