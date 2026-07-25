import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AdminRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import type { AppConfiguration } from '../../config/configuration';
import { parseDurationToSeconds } from '../../common/utils/duration.util';
import { AdminsService } from '../admins/admins.service';
import type { AdminProfileDto, LoginResponseDto } from './dto/auth-response.dto';
import type { LoginDto } from './dto/login.dto';
import type { AuthenticatedAdmin, JwtPayload } from './interfaces/jwt-payload.interface';

/**
 * Credential verification and token issuing.
 *
 * Security notes:
 *  - passwords are only ever compared as bcrypt hashes;
 *  - an unknown email is compared against a decoy hash so response time does
 *    not reveal whether an account exists (user-enumeration defence);
 *  - the same generic message is returned for both failure modes.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly decoyHash: string;
  private readonly expiresInSeconds: number;

  constructor(
    private readonly adminsService: AdminsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfiguration, true>,
  ) {
    const saltRounds = this.configService.get('security.bcryptSaltRounds', { infer: true });
    this.decoyHash = bcrypt.hashSync(randomUUID(), saltRounds);
    this.expiresInSeconds = parseDurationToSeconds(
      this.configService.get('jwt.expiresIn', { infer: true }),
    );
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const admin = await this.adminsService.findByEmail(dto.email);
    const passwordMatches = await bcrypt.compare(dto.password, admin?.password ?? this.decoyHash);

    if (!admin || !passwordMatches) {
      this.logger.warn(`Rejected login attempt for "${dto.email}"`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = { sub: admin.id, email: admin.email, role: admin.role };
    const accessToken = await this.jwtService.signAsync(payload);

    this.logger.log(`Admin ${admin.email} signed in`);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.expiresInSeconds,
      admin: this.toProfile(admin),
    };
  }

  /**
   * Access tokens are stateless and short-lived, so logout is a client-side
   * concern (the browser cookie is cleared by the Next.js route handler).
   * The endpoint exists so the audit log has a matching event.
   */
  logout(admin: AuthenticatedAdmin): AdminProfileDto {
    this.logger.log(`Admin ${admin.email} signed out`);
    return this.toProfile(admin);
  }

  /** Hashes a plaintext password using the configured cost factor. */
  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(
      password,
      this.configService.get('security.bcryptSaltRounds', { infer: true }),
    );
  }

  private toProfile(admin: { id: string; email: string; role: AdminRole }): AdminProfileDto {
    return { id: admin.id, email: admin.email, role: admin.role };
  }
}
