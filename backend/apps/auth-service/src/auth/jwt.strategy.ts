import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JWT_CONFIG } from './constants/jwt.constants';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_CONFIG.ACCESS_TOKEN_SECRET,
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.id, email: payload.email, role: payload.role };
  }
}
