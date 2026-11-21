import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';

const userSelect = { id: true, email: true, displayName: true, avatarUrl: true, timezone: true, createdAt: true, updatedAt: true } as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: userSelect });
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }
  async updateMe(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({ where: { id: userId }, data: { displayName: dto.displayName?.trim(), avatarUrl: dto.avatarUrl, timezone: dto.timezone }, select: userSelect });
  }
}
