import { NotFoundException } from '@nestjs/common';
import { MemoriesService } from './memories.service.js';

describe('MemoriesService', () => {
  const memory = { id: 'memory-1', userId: 'owner', title: 'Ella', description: null, memoryDate: new Date(), locationName: 'Ella', latitude: null, longitude: null, privacy: 'PRIVATE', createdAt: new Date(), updatedAt: new Date(), media: [], favorites: [] };
  function setup() {
    const prisma: any = { memory: { create: vi.fn().mockResolvedValue(memory), findFirst: vi.fn().mockResolvedValue(memory), count: vi.fn().mockResolvedValue(1), findMany: vi.fn().mockResolvedValue([memory]), update: vi.fn().mockResolvedValue(memory), delete: vi.fn() }, favorite: { upsert: vi.fn(), deleteMany: vi.fn() }, memoryMedia: { deleteMany: vi.fn(), createMany: vi.fn() }, $transaction: vi.fn((input: any) => Array.isArray(input) ? Promise.all(input) : input(prisma)) };
    return { prisma, service: new MemoriesService(prisma) };
  }
  it('creates and lists only the authenticated user’s memories', async () => {
    const { service } = setup();
    expect((await service.create('owner', { title: 'Ella', memoryDate: '2026-01-01', isFavorite: false })).title).toBe('Ella');
    const listed = await service.list('owner', { page: 1, limit: 20 });
    expect(listed.meta.total).toBe(1); expect(listed.data[0].isFavorite).toBe(false);
  });
  it('prevents access to a memory not owned by the requester', async () => {
    const { prisma, service } = setup(); prisma.memory.findFirst.mockResolvedValue(null);
    await expect(service.findOne('another-user', 'memory-1')).rejects.toBeInstanceOf(NotFoundException);
  });
  it('updates favorite state and deletes an owned memory', async () => {
    const { prisma, service } = setup();
    await service.update('owner', 'memory-1', { isFavorite: true });
    expect(prisma.favorite.upsert).toHaveBeenCalled();
    await service.remove('owner', 'memory-1'); expect(prisma.memory.delete).toHaveBeenCalledWith({ where: { id: 'memory-1' } });
  });
  it('stores photo URLs as ordered image media and replaces them on update', async () => {
    const { prisma, service } = setup();
    await service.create('owner', { title: 'Galle', memoryDate: '2026-02-14', photoUrls: ['https://example.com/a.jpg', 'https://example.com/b.jpg'] });
    const created = prisma.memory.create.mock.calls[0][0].data.media.create;
    expect(created.map((media: any) => [media.type, media.url, media.sortOrder])).toEqual([['IMAGE', 'https://example.com/a.jpg', 0], ['IMAGE', 'https://example.com/b.jpg', 1]]);
    expect(new Set(created.map((media: any) => media.publicId)).size).toBe(2);
    await service.update('owner', 'memory-1', { photoUrls: ['https://example.com/c.jpg'] });
    expect(prisma.memoryMedia.deleteMany).toHaveBeenCalledWith({ where: { memoryId: 'memory-1' } });
    expect(prisma.memoryMedia.createMany.mock.calls[0][0].data[0]).toMatchObject({ url: 'https://example.com/c.jpg', memoryId: 'memory-1' });
    expect(prisma.memory.update.mock.calls[0][0].data).not.toHaveProperty('photoUrls');
  });
});
