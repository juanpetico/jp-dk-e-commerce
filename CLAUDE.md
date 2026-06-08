# CLAUDE.md — Guía del Proyecto

Documento de referencia para el equipo y la IA. Captura convenciones y decisiones duraderas, **no** implementaciones individuales. Actualizar solo cuando cambia una convención, no cuando se usa la existente.

---

## ¿De qué trata la app?

E-commerce con panel de administración. Incluye tienda pública (catálogo, carrito, checkout, perfil de cliente) y panel admin (productos, órdenes, clientes, marketing, auditoría).

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 15, TypeScript, Tailwind CSS v3, shadcn/ui |
| Backend | Express.js 5, Prisma 7, PostgreSQL |
| Email | Resend |
| Tipografía | Montserrat (Google Fonts) |
| Package manager | pnpm 9 |
| Node | >= 22 |

Deployments: frontend y backend en Vercel. Base de datos PostgreSQL en Supabase.

---

## Estructura de carpetas

```
apps/
  web/                        ← Next.js (App Router)
    app/                      ← rutas Next.js
    src/
      components/
        admin/                ← panel de administración
          shared/             ← componentes reutilizables del admin
          [feature]/          ← carpeta por funcionalidad (orders, products, etc.)
        ui/                   ← primitivos shadcn/ui
        home/ product/ checkout/ auth/ profile/ store/ layout/
      hooks/
      lib/
      services/
      store/
      utils/
      types.ts
  server/                     ← Express.js
    src/
      controllers/
      routes/
      services/
      middleware/
      config/
      utils/
packages/
  ui/                         ← componentes UI compartidos entre apps
```

---

## Convenciones de componentes

### Nombrado de archivos

Los componentes de una página se dividen usando **dot notation** sobre el nombre de la página:

```
OrdersPageClient.tsx          ← componente raíz (cliente)
OrdersPage.table.tsx          ← sub-componente tabla
OrdersPage.filters.tsx        ← sub-componente filtros
OrdersPage.header.tsx         ← sub-componente header
OrdersPage.types.ts           ← tipos específicos de la página
OrdersPage.utils.ts           ← utilidades específicas
OrdersPage.skeleton.tsx       ← estado de carga
OrdersPage.csv.ts             ← lógica de exportación CSV
OrdersPage.pdf.ts             ← lógica de exportación PDF
```

Componentes compartidos del admin van en `components/admin/shared/`.

### Estructura interna de un componente

```tsx
"use client" // solo si necesita estado o hooks del browser

import React from 'react'
// 1. librerías externas
// 2. componentes UI (@/components/ui/...)
// 3. componentes del proyecto
// 4. hooks, servicios, utils
// 5. tipos

interface ComponentNameProps {
    // props explícitas con tipos
    className?: string
}

export default function ComponentName({ prop, className }: ComponentNameProps) {
    return (...)
}
```

- Siempre definir `interface` de props (nunca inline types en el parámetro)
- Usar `cn()` de `@/lib/utils` para combinar clases condicionales
- Exports nombrados para sub-componentes, default export para el componente principal

---

## Sistema de colores y estilos

Los colores son **CSS variables** con soporte dark mode vía clase `.dark`. Siempre usar los tokens semánticos, nunca valores hardcoded.

| Token | Light | Dark |
|-------|-------|------|
| `background` | blanco `#fff` | negro puro `#000` |
| `foreground` | casi negro | blanco |
| `primary` | casi negro | blanco |
| `muted` | gris claro `240 4.8% 95.9%` | gris oscuro |
| `border` | `240 5.9% 90%` | `240 3.7% 15.9%` |
| `destructive` | rojo | rojo oscuro |

**Border radius:** `--radius: 0.5rem` → `rounded-lg` (0.5rem) / `rounded-md` (0.375rem) / `rounded-sm` (0.25rem)

**Bordes en contenedores:**
```tsx
// Patrón estándar en inputs y contenedores del admin
className="border border-gray-300 dark:border-border"
```

Ver `docs/design-system.md` para paleta completa y componentes visuales.

---

## Variables de entorno

### Frontend (`apps/web/.env.local`)

Copiar desde `apps/web/.env.example`.

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL del backend (`http://localhost:5001/api` en dev) |
| `REVALIDATE_SECRET` | Secret para revalidación ISR (mín. 32 chars, debe coincidir con el backend) |

### Backend (`apps/server/.env`)

> **Setup local obligatorio:** copiar `apps/server/.env.example` → `apps/server/.env` antes de levantar el server. Sin este archivo, `DATABASE_URL` queda `undefined`, el server **arranca igual pero falla silenciosamente con `400 Bad Request`** en cada query (el `error-handler` mapea el error de Prisma a 400 "Database error"). Para dev local, `DATABASE_URL` apunta al Postgres de `docker-compose` (`postgresql://ecommerce_user:ecommerce_password@localhost:5432/ecommerce_db`).

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `PRISMA_DATABASE_URL` | (Opcional) URL específica para comandos Prisma en CI/CD |
| `DATABASE_URL_LOCAL` | (Opcional) URL local para migraciones en desarrollo |
| `JWT_SECRET` | Secret para firmar JWT |
| `RESEND_API_KEY` | API key de Resend para emails |
| `STOREFRONT_REVALIDATE_SECRET` | Debe coincidir con `REVALIDATE_SECRET` del frontend |
| `PORT` | Puerto del servidor (default: 5001) |

**Reglas:**
- Nunca commitear `.env.local` ni `.env` con valores reales
- Variables públicas del frontend llevan prefijo `NEXT_PUBLIC_`
- Al agregar una variable nueva, actualizar el `.env.example` correspondiente y esta tabla

### Flujo recomendado para migraciones Prisma

**Comandos disponibles:**

| Comando | Entorno | Descripción |
|---------|---------|-------------|
| `pnpm --filter @repo/server migrate:deploy` | Remoto (Supabase) | Aplica migraciones en producción/staging |
| `pnpm --filter @repo/server migrate:deploy:local` | Local | Aplica migraciones en desarrollo local |

**Configuración de variables:**

- **Local:** Usar `DATABASE_URL_LOCAL` → base local (ej: `localhost`)
- **Remoto:** Usar `PRISMA_DATABASE_URL` → base remota (Supabase)
- `DATABASE_URL` se mantiene para runtime del backend (idealmente mismo entorno remoto en deploy)

**Reglas:**
- Evitar cambiar/comentar variables manualmente para alternar entre local y remoto
- En desarrollo, usar siempre el comando `:local`
- En CI/CD o deploy, usar el comando sin sufijo

### Build del backend en Vercel (`ecommerce-api`)

El proyecto `ecommerce-api` (root `apps/server`) se construye con el builder `@vercel/node`, que ejecuta `tsc` para typecheckear `api/index.ts` y todos sus imports.

**Reglas para no romper el build:**
- El cliente de Prisma **debe estar generado antes del typecheck**. Por eso `apps/server/package.json` tiene `"postinstall": "prisma generate"`. Si falta, `import { Prisma } from "@prisma/client"` falla y arrastra en cascada errores falsos de tipos de Express (`Router.post`, `Request.method`, parámetros `any` implícito). **No tocar/eliminar el `postinstall`.**
- `dev` usa `tsx`, que **no** chequea tipos. Antes de pushear cambios al backend, correr `pnpm --filter @repo/server build` (o `npx tsc --noEmit`) para detectar errores que solo aparecerían en el build de Vercel.
- Toda dependencia runtime que se importe en TS necesita sus tipos en `devDependencies` (ej. `pg` → `@types/pg`).
- `engines.node` se fija a la major exacta del proyecto en Vercel (ej. `"24.x"`, no `">=22"`) para evitar el warning de auto-upgrade y no forzar un downgrade respecto al setting del proyecto.
- **No usar dependencias con binarios nativos** (`.node`). pnpm ignora sus build scripts por seguridad, así que el binario no se compila y la lambda crashea en runtime con `Cannot find module '...bcrypt_lib.node'`. Preferir alternativas en JS puro (ej. `bcryptjs` en vez de `bcrypt`, ya adoptado). Si un nativo es inevitable, agregarlo a `onlyBuiltDependencies` en la config de pnpm y validar el binario en la arquitectura del runtime.

> Nota: `@vercel/node` imprime los errores de tipo pero **no falla el deploy** (queda `READY`). Conviene revisar el log igual.

---

## Commits y ramas

Ver `CONTRIBUTING.md` para el flujo completo. Resumen:

**Formato de commit:** `<tipo>: <descripción en minúsculas>`  
Tipos: `feat`, `fix`, `docs`, `refactor`, `chore`  
Mensajes en español, tipo en inglés.

**Ramas:** siempre desde `develop`, con prefijo `feat/`, `fix/`, `docs/`, `refactor/`, `chore/`.

---

## Cuándo actualizar este documento

✅ Actualizar cuando:
- Cambia la estructura de carpetas
- Se adopta un nuevo patrón de componentes
- Se agrega una variable de entorno nueva
- Cambia el stack (nueva librería, reemplazo de tecnología)
- Se establece una nueva convención que el equipo acordó seguir

❌ No actualizar cuando:
- Se agrega una feature siguiendo los patrones existentes
- Se corrige un bug
- Se refactoriza sin cambiar convenciones
