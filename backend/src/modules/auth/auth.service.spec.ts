import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminRole } from '@prisma/client';
import type { Admin } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AdminsService } from '../admins/admins.service';
import { AuthService } from './auth.service';

const PASSWORD = 'Admin@12345';

const configValues: Record<string, unknown> = {
  'security.bcryptSaltRounds': 10,
  'jwt.expiresIn': '1d',
};

describe('AuthService', () => {
  let service: AuthService;
  let adminsService: jest.Mocked<Pick<AdminsService, 'findByEmail' | 'findById'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;
  let admin: Admin;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    admin = {
      id: '2f1c6f2e-2d47-4a5b-9f4e-1d3f9a0b7c11',
      email: 'admin@leaddesk.dev',
      password: passwordHash,
      role: AdminRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  beforeEach(async () => {
    adminsService = { findByEmail: jest.fn(), findById: jest.fn() };
    jwtService = { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AdminsService, useValue: adminsService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: (key: string) => configValues[key] } },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('issues a token for valid credentials', async () => {
    adminsService.findByEmail.mockResolvedValue(admin);

    const result = await service.login({ email: admin.email, password: PASSWORD });

    expect(result.accessToken).toBe('signed.jwt.token');
    expect(result.tokenType).toBe('Bearer');
    expect(result.expiresIn).toBe(86_400);
    expect(result.admin).toEqual({ id: admin.id, email: admin.email, role: AdminRole.ADMIN });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: admin.id,
      email: admin.email,
      role: AdminRole.ADMIN,
    });
  });

  it('never returns the password hash', async () => {
    adminsService.findByEmail.mockResolvedValue(admin);

    const result = await service.login({ email: admin.email, password: PASSWORD });

    expect(JSON.stringify(result)).not.toContain(admin.password);
  });

  it('rejects a wrong password', async () => {
    adminsService.findByEmail.mockResolvedValue(admin);

    await expect(
      service.login({ email: admin.email, password: 'WrongPassword1' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('rejects an unknown email with the same generic message', async () => {
    adminsService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'nobody@leaddesk.dev', password: PASSWORD }),
    ).rejects.toThrow('Invalid email or password');
  });

  it('hashes passwords instead of storing them', async () => {
    const hash = await service.hashPassword(PASSWORD);

    expect(hash).not.toBe(PASSWORD);
    await expect(bcrypt.compare(PASSWORD, hash)).resolves.toBe(true);
  });
});
