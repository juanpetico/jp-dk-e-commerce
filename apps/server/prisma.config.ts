import { defineConfig, env } from '@prisma/config';
import 'dotenv/config';

// Resolvemos la URL de la datasource sin romper cuando no hay credenciales en el
// entorno (ej. `prisma generate` durante el build de la web, que no conecta a la DB).
// Las credenciales reales solo hacen falta para migrate/runtime, donde sí están seteadas.
const prismaDatabaseUrl = (() => {
  try {
    return env('PRISMA_DATABASE_URL');
  } catch {}
  try {
    return env('DATABASE_URL');
  } catch {}
  // Placeholder válido para que `prisma generate` funcione sin conexión.
  return 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
})();

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: prismaDatabaseUrl,
  },
});
