import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.jwt.secret,
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub || payload.userId,      // Add id for RBAC service compatibility
      userId: payload.sub || payload.userId,
      sub: payload.sub || payload.userId,
      roles: payload.roles,                   // Legacy role support
      rbacRoles: payload.rbacRoles || [],     // RBAC roles
      permissions: payload.permissions || []  // RBAC permissions
    };
  }
}
