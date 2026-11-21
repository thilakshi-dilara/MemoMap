import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateMemoryDto } from './create-memory.dto.js';

describe('CreateMemoryDto', () => {
  it('rejects invalid memory input', async () => {
    const dto = plainToInstance(CreateMemoryDto, { title: '', memoryDate: 'not-a-date', latitude: 100 });
    expect(await validate(dto)).not.toHaveLength(0);
  });
});
