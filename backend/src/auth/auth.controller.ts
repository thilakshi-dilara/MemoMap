import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags, ApiTooManyRequestsResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register') @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Register a new MemoMap account' }) @ApiBody({ type: RegisterDto }) @ApiTooManyRequestsResponse()
  register(@Body() dto: RegisterDto) { return this.authService.register(dto); }

  @Post('login') @HttpCode(200) @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Sign in and receive an access and refresh token' }) @ApiBody({ type: LoginDto }) @ApiUnauthorizedResponse() @ApiTooManyRequestsResponse()
  login(@Body() dto: LoginDto) { return this.authService.login(dto); }

  @Post('refresh') @HttpCode(200) @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Rotate a refresh token and issue a new token pair' }) @ApiBody({ type: RefreshTokenDto }) @ApiUnauthorizedResponse()
  refresh(@Body() dto: RefreshTokenDto) { return this.authService.refresh(dto.refreshToken); }

  @Post('logout') @HttpCode(204) @ApiOperation({ summary: 'Revoke the supplied refresh token' }) @ApiBody({ type: RefreshTokenDto }) @ApiOkResponse({ description: 'Token revoked when valid.' })
  async logout(@Body() dto: RefreshTokenDto): Promise<void> { await this.authService.logout(dto.refreshToken); }
}
