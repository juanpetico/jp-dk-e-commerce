import { defineConfig, env } from '@prisma/config';
import 'dotenv/config';

const prismaDatabaseUrl = (() => {
  try {
    return env('PRISMA_DATABASE_URL');
  } catch {
    return env('DATABASE_URL');
  }
})();

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: prismaDatabaseUrl,
  },
});
