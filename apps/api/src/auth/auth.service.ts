import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from '../users/users.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  async login(email: string, password: string, lang: string) {
    const user = await this.users.findByEmailWithHash(email);

    const invalidCredentials = this.i18n.t('auth.invalid_credentials', { lang });

    if (!user) throw new UnauthorizedException(invalidCredentials);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException(invalidCredentials);

    // Pass role so it is included in both access and refresh token payloads
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async refresh(refreshToken: string, lang: string) {
    let payload: { sub: string; email: string; role: Role };

    try {
      payload = await this.jwt.verifyAsync<{ sub: string; email: string; role: Role }>(
        refreshToken,
        { secret: this.config.get<string>('JWT_REFRESH_SECRET') },
      );
    } catch {
      throw new ForbiddenException(this.i18n.t('auth.refresh_token_invalid_expired', { lang }));
    }

    const user = await this.users.findById(payload.sub);
    const accessDenied = this.i18n.t('auth.access_denied', { lang });

    if (!user) throw new ForbiddenException(accessDenied);

    const storedHash = user.refreshTokenHash;
    if (!storedHash) throw new ForbiddenException(accessDenied);

    const tokenMatch = await bcrypt.compare(refreshToken, storedHash);
    if (!tokenMatch) {
      throw new ForbiddenException(this.i18n.t('auth.refresh_token_invalid', { lang }));
    }

    // Re-read role from DB to always reflect the current value
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.users.clearRefreshToken(userId);
  }

  private async generateTokens(userId: string, email: string, role: Role) {
    // Include role in payload so RolesGuard can read it from req.user
    const payload = { sub: userId, email, role };

    const accessSecret = this.config.get<string>('JWT_SECRET');
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    if (!accessSecret || !refreshSecret) throw new Error('JWT secrets not set');

    const rawAccess = this.config.get<string>('JWT_EXPIRES_IN') ?? '15m';
    const rawRefresh = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    const toExpiry = (raw: string): StringValue | number =>
      /^\d+$/.test(raw) ? Number(raw) : (raw as StringValue);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: accessSecret,
        expiresIn: toExpiry(rawAccess),
      }),
      this.jwt.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: toExpiry(rawRefresh),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.users.updateRefreshToken(userId, hash);
  }
}
