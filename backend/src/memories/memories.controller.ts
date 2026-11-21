import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { AuthUser } from '../common/auth/auth-user.interface.js';
import { CurrentUser } from '../common/auth/current-user.decorator.js';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard.js';
import { CreateMemoryDto } from './dto/create-memory.dto.js';
import { ListMemoriesDto } from './dto/list-memories.dto.js';
import { UpdateMemoryDto } from './dto/update-memory.dto.js';
import { MemoriesService } from './memories.service.js';

@ApiTags('memories') @ApiBearerAuth() @ApiUnauthorizedResponse() @UseGuards(JwtAuthGuard)
@Controller('memories')
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}
  @Post() @ApiOperation({ summary: 'Create a private memory' }) @ApiCreatedResponse()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateMemoryDto) { return this.memoriesService.create(user.id, dto); }
  @Get() @ApiOperation({ summary: 'List the authenticated user’s memories' }) @ApiOkResponse()
  list(@CurrentUser() user: AuthUser, @Query() query: ListMemoriesDto) { return this.memoriesService.list(user.id, query); }
  @Get(':id') @ApiOperation({ summary: 'Get one owned memory' }) @ApiOkResponse() @ApiNotFoundResponse()
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.memoriesService.findOne(user.id, id); }
  @Patch(':id') @ApiOperation({ summary: 'Update one owned memory' }) @ApiOkResponse() @ApiNotFoundResponse()
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateMemoryDto) { return this.memoriesService.update(user.id, id, dto); }
  @Delete(':id') @HttpCode(204) @ApiOperation({ summary: 'Delete one owned memory' }) @ApiNoContentResponse() @ApiNotFoundResponse()
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<void> { await this.memoriesService.remove(user.id, id); }
}
