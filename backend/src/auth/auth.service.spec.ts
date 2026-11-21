import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';

const environment = { DATABASE_URL: 'mysql://x', FRONTEND_ORIGIN: '', NODE_ENV: 'test', PORT: 3000, JWT_ACCESS_SECRET: 'a-secure-test-secret-that-is-long-enough', JWT_ACCESS_EXPIRES_IN: '15m', REFRESH_TOKEN_TTL_DAYS: 30 };

describe('AuthService', () => {
  const user = { id: 'user-1', email: 'me@example.com', displayName: 'Me', avatarUrl: null, timezone: 'UTC', createdAt: new Date(), updatedAt: new Date() };
  beforeEach(() => { Object.assign(process.env, environment); });
  function service(overrides: Record<string, unknown> = {}) {
    const prisma: any = { user: { findUnique: vi.fn(), create: vi.fn() }, refreshToken: { create: vi.fn().mockResolvedValue({ id: 'token-1' }), findUnique: vi.fn(), updateMany: vi.fn().mockResolvedValue({ count: 1 }) }, $transaction: vi.fn(async (fn: any) => fn(prisma)), ...overrides };
    return { prisma, auth: new AuthService(prisma, new JwtService()) };
  }
  it('registers a user without returning a password hash', async () => {
    const { prisma, auth } = service(); prisma.user.create.mockResolvedValue(user);
    const result = await auth.register({ email: user.email, displayName: 'Me', password: 'ValidPassword1' });
    expect(result.user).toEqual(user); expect(result).not.toHaveProperty('passwordHash'); expect(result.refreshToken).toContain('.');
  });
  it('rejects duplicate registration and invalid login', async () => {
    const duplicate = service(); duplicate.prisma.user.findUnique.mockResolvedValue({ id: user.id });
    await expect(duplicate.auth.register({ email: user.email, displayName: 'Me', password: 'ValidPassword1' })).rejects.toBeInstanceOf(ConflictException);
    const login = service(); login.prisma.user.findUnique.mockResolvedValue(null);
    await expect(login.auth.login({ email: user.email, password: 'wrong' })).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('rotates a valid refresh token and revokes it on logout', async () => {
    const { prisma, auth } = service(); const hash = await argon2.hash('refresh-secret');
    prisma.refreshToken.findUnique.mockResolvedValue({ id: 'token-1', tokenHash: hash, revokedAt: null, expiresAt: new Date(Date.now() + 60_000), user });
    const tokens = await auth.refresh('token-1.refresh-secret'); expect(tokens.refreshToken).not.toBe('token-1.refresh-secret');
    await auth.logout('token-1.refresh-secret'); expect(prisma.refreshToken.updateMany).toHaveBeenCalled();
  });
});
