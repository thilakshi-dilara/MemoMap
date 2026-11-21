import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // Runtime startup validates DATABASE_URL strictly. A harmless local default keeps
  // static tools (lint/type checks) usable before a developer creates `.env`.
  datasource: {
    url: process.env.DATABASE_URL ?? 'mysql://memomap_user:change_me@localhost:3306/memomap_db',
  },
});
