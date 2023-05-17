import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@src/services';
import { User } from '@src/interfaces';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRETS_JWT,
    });
  }

  async validate(user: User) {
    const isAdmin = await this.authService.isAdmin(user);
    if (!isAdmin) {
      throw new UnauthorizedException("User is not an admin");
    }
    return user;
  }
}