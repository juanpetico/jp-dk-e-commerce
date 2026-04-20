import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import dotenv from 'dotenv';

const serverRoot = resolve(import.meta.dirname, '..');
const envPath = resolve(serverRoot, '.env');

dotenv.config({ path: envPath });

const modeArg = process.argv.find((arg) => arg.startsWith('--env='));
const mode = modeArg?.split('=')[1] ?? 'prod';
const useLocal = mode === 'local';

const localUrl = process.env.DATABASE_URL_LOCAL;
const defaultUrl = process.env.DATABASE_URL;

const selectedUrl = useLocal ? localUrl : (process.env.PRISMA_DATABASE_URL || defaultUrl);

if (!selectedUrl) {
  const missingKey = useLocal ? 'DATABASE_URL_LOCAL' : 'DATABASE_URL or PRISMA_DATABASE_URL';
  console.error(`[migrate:deploy] Missing ${missingKey} in apps/server/.env`);
  process.exit(1);
}

const env = {
  ...process.env,
  PRISMA_DATABASE_URL: selectedUrl,
};

const maskedUrl = (() => {
  try {
    const parsed = new URL(selectedUrl);
    parsed.password = '***';
    return parsed.toString();
  } catch {
    return '<invalid-url>';
  }
})();

console.log(`[migrate:deploy] Target env: ${useLocal ? 'local' : 'prod'}`);
console.log(`[migrate:deploy] Using datasource: ${maskedUrl}`);

try {
  const command = process.platform === 'win32' ? 'pnpm exec prisma migrate deploy' : 'pnpm exec prisma migrate deploy';
  execSync(command, {
    cwd: serverRoot,
    env,
    stdio: 'inherit',
  });
} catch (error) {
  console.error('[migrate:deploy] Prisma deploy failed', error);
  process.exit(1);
}
