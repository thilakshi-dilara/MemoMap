import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { validateEnvironment } from '../config/environment.validation.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';

type SafeUser = { id: string; email: string; displayName: string; avatarUrl: string | null; timezone: string; createdAt: Date; updatedAt: Date };
type TokenPair = { accessToken: string; refreshToken: string };
type AuthResponse = TokenPair & { user: SafeUser };
const safeUserSelect = { id: true, email: true, displayName: true, avatarUrl: true, timezone: true, createdAt: true, updatedAt: true } as const;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const exists = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) throw new ConflictException('An account with that email already exists.');
    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    const user = await this.prisma.user.create({ data: { email, displayName: dto.displayName.trim(), passwordHash }, select: safeUserSelect });
    return { user, ...(await this.issueTokens(user.id, user.email)) };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.trim().toLowerCase() } });
    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) throw new UnauthorizedException('Invalid email or password.');
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return { user: safeUser, ...(await this.issueTokens(user.id, user.email)) };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const [id, secret] = refreshToken.split('.');
    if (!id || !secret) throw new UnauthorizedException('Invalid refresh token.');
    const existing = await this.prisma.refreshToken.findUnique({ where: { id }, include: { user: { select: { id: true, email: true } } } });
    if (!existing || existing.revokedAt || existing.expiresAt <= new Date() || !(await argon2.verify(existing.tokenHash, secret))) throw new UnauthorizedException('Invalid or expired refresh token.');
    return this.prisma.$transaction(async (transaction) => {
      const revoked = await transaction.refreshToken.updateMany({ where: { id, revokedAt: null }, data: { revokedAt: new Date() } });
      if (revoked.count !== 1) throw new UnauthorizedException('Refresh token has already been used.');
      return this.issueTokens(existing.user.id, existing.user.email, transaction);
    });
  }

  async logout(refreshToken: string): Promise<void> {
    const [id, secret] = refreshToken.split('.');
    if (!id || !secret) return;
    const existing = await this.prisma.refreshToken.findUnique({ where: { id } });
    if (existing && await argon2.verify(existing.tokenHash, secret)) await this.prisma.refreshToken.updateMany({ where: { id, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  private async issueTokens(userId: string, email: string, prisma: Pick<PrismaService, 'refreshToken'> = this.prisma): Promise<TokenPair> {
    const environment = validateEnvironment(process.env);
    const accessToken = await this.jwtService.signAsync({ sub: userId, email, type: 'access' }, { secret: environment.JWT_ACCESS_SECRET, expiresIn: environment.JWT_ACCESS_EXPIRES_IN });
    const secret = randomBytes(48).toString('base64url');
    const tokenHash = await argon2.hash(secret, { type: argon2.argon2id });
    const record = await prisma.refreshToken.create({ data: { tokenHash, expiresAt: new Date(Date.now() + environment.REFRESH_TOKEN_TTL_DAYS * 86_400_000), userId } });
    return { accessToken, refreshToken: `${record.id}.${secret}` };
  }
}
