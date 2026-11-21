import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { validateEnvironment } from '../../config/environment.validation.js';
import type { AuthUser } from './auth-user.interface.js';

type AuthenticatedRequest = Request & { user?: AuthUser };
type JwtPayload = { sub: string; email: string; type: 'access' };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) throw new UnauthorizedException('A bearer access token is required.');
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(authorization.slice(7), { secret: validateEnvironment(process.env).JWT_ACCESS_SECRET });
      if (payload.type !== 'access' || !payload.sub || !payload.email) throw new UnauthorizedException('Invalid access token.');
      request.user = { id: payload.sub, email: payload.email };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }
  }
}
