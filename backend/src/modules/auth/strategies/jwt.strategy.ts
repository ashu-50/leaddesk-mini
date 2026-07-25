import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AppConfiguration } from '../../../config/configuration';
import { AdminsService } from '../../admins/admins.service';
import { JWT_ISSUER, JWT_STRATEGY_NAME } from '../auth.constants';
import type { AuthenticatedAdmin, JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Validates the signature and expiry of the bearer token, then re-checks the
 * subject against the database. A deleted admin cannot keep using a token that
 * has not expired yet.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY_NAME) {
  constructor(
    configService: ConfigService<AppConfiguration, true>,
    private readonly adminsService: AdminsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret', { infer: true }),
      issuer: JWT_ISSUER,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedAdmin> {
    const admin = await this.adminsService.findById(payload.sub);

    if (!admin) {
      throw new UnauthorizedException('This session is no longer valid');
    }

    return { id: admin.id, email: admin.email, role: admin.role };
  }
}
