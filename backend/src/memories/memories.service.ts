import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateMemoryDto } from './dto/create-memory.dto.js';
import type { ListMemoriesDto } from './dto/list-memories.dto.js';
import type { UpdateMemoryDto } from './dto/update-memory.dto.js';

const memoryInclude = (userId: string) => ({ media: { orderBy: { sortOrder: 'asc' as const } }, favorites: { where: { userId }, select: { id: true } } });
// URL-based photos have no external storage id, so publicId gets a unique local value.
const mediaFromUrls = (urls: string[]) => urls.map((url, sortOrder) => ({ type: 'IMAGE' as const, url, publicId: `url_${randomUUID()}`, sortOrder }));

@Injectable()
export class MemoriesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(userId: string, dto: CreateMemoryDto) {
    const memory = await this.prisma.memory.create({ data: { userId, title: dto.title.trim(), description: dto.description?.trim(), memoryDate: new Date(dto.memoryDate), locationName: dto.locationName?.trim(), latitude: dto.latitude, longitude: dto.longitude, favorites: dto.isFavorite ? { create: { userId } } : undefined, media: dto.photoUrls?.length ? { create: mediaFromUrls(dto.photoUrls) } : undefined }, include: memoryInclude(userId) });
    return this.serialize(memory);
  }
  async list(userId: string, query: ListMemoriesDto) {
    const where: Prisma.MemoryWhereInput = { userId, ...(query.search ? { title: { contains: query.search.trim() } } : {}), ...(query.location ? { locationName: { contains: query.location.trim() } } : {}), ...(query.startDate || query.endDate ? { memoryDate: { ...(query.startDate ? { gte: new Date(query.startDate) } : {}), ...(query.endDate ? { lte: new Date(query.endDate) } : {}) } } : {}) };
    const [total, memories] = await this.prisma.$transaction([this.prisma.memory.count({ where }), this.prisma.memory.findMany({ where, include: memoryInclude(userId), orderBy: [{ memoryDate: 'desc' }, { createdAt: 'desc' }], skip: (query.page - 1) * query.limit, take: query.limit })]);
    return { data: memories.map((memory) => this.serialize(memory)), meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  }
  async findOne(userId: string, id: string) { return this.serialize(await this.findOwned(userId, id)); }
  async update(userId: string, id: string, dto: UpdateMemoryDto) {
    await this.findOwned(userId, id);
    const { isFavorite, memoryDate, photoUrls, ...values } = dto;
    const memory = await this.prisma.$transaction(async (transaction) => {
      if (photoUrls !== undefined) {
        await transaction.memoryMedia.deleteMany({ where: { memoryId: id } });
        if (photoUrls.length) await transaction.memoryMedia.createMany({ data: mediaFromUrls(photoUrls).map((media) => ({ ...media, memoryId: id })) });
      }
      if (isFavorite !== undefined) {
        if (isFavorite) await transaction.favorite.upsert({ where: { userId_memoryId: { userId, memoryId: id } }, create: { userId, memoryId: id }, update: {} });
        else await transaction.favorite.deleteMany({ where: { userId, memoryId: id } });
      }
      return transaction.memory.update({ where: { id }, data: { ...values, ...(values.title ? { title: values.title.trim() } : {}), ...(values.description ? { description: values.description.trim() } : {}), ...(values.locationName ? { locationName: values.locationName.trim() } : {}), ...(memoryDate ? { memoryDate: new Date(memoryDate) } : {}) }, include: memoryInclude(userId) });
    });
    return this.serialize(memory);
  }
  async remove(userId: string, id: string): Promise<void> { await this.findOwned(userId, id); await this.prisma.memory.delete({ where: { id } }); }
  private async findOwned(userId: string, id: string) {
    const memory = await this.prisma.memory.findFirst({ where: { id, userId }, include: memoryInclude(userId) });
    if (!memory) throw new NotFoundException('Memory not found.');
    return memory;
  }
  private serialize(memory: Awaited<ReturnType<MemoriesService['findOwned']>>) {
    const { favorites, latitude, longitude, ...rest } = memory;
    return { ...rest, latitude: latitude === null ? null : Number(latitude), longitude: longitude === null ? null : Number(longitude), isFavorite: favorites.length > 0 };
  }
}
