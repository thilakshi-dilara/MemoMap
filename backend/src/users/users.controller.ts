import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { AuthUser } from '../common/auth/auth-user.interface.js';
import { CurrentUser } from '../common/auth/current-user.decorator.js';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users') @ApiBearerAuth() @ApiUnauthorizedResponse() @UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('me') @ApiOperation({ summary: 'Get the authenticated user profile' }) @ApiOkResponse()
  me(@CurrentUser() user: AuthUser) { return this.usersService.me(user.id); }
  @Patch('me') @ApiOperation({ summary: 'Update the authenticated user profile' }) @ApiOkResponse()
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) { return this.usersService.updateMe(user.id, dto); }
}
