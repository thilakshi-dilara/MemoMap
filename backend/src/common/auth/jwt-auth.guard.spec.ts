import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  beforeEach(() => { Object.assign(process.env, { DATABASE_URL: 'mysql://x', JWT_ACCESS_SECRET: 'a-secure-test-secret-that-is-long-enough', NODE_ENV: 'test' }); });
  it('rejects a request without a bearer token', async () => {
    const guard = new JwtAuthGuard(new JwtService());
    const context = { switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }) } as unknown as ExecutionContext;
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
