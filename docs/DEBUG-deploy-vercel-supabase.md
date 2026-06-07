# Debug — Deploy Vercel + Supabase (sesión 2026-06-03/04)

Bitácora de los problemas de producción que enfrentamos al desplegar `ecommerce-api` (backend Express en Vercel, root `apps/server`) y `ecommerce-web` (Next.js) contra Supabase. Documenta lo resuelto y lo que queda pendiente para retomar en otro momento.

## Contexto / IDs útiles

- Proyecto Vercel API: `ecommerce-api` → `prj_R0mOXPaxkl2MciXMRzvTTSbPptyx`
- Proyecto Vercel Web: `ecommerce-web` → `prj_QtZ1iQFugWUhcAu03riAgIWtIRAT`
- Team: `team_3tKFQthpVTtij2NoJktMBgVC`
- Supabase project ref: `xxouidlranxofewodztt`
- Dominio prod web: `https://ecommerce-web-three-alpha.vercel.app`
- Dominio prod API (alias): `https://ecommerce-api-dun.vercel.app` → `NEXT_PUBLIC_API_URL = https://ecommerce-api-dun.vercel.app/api`
- Builder API: `@vercel/node` (compila `api/index.ts`, que reexporta `src/app.ts`)
- DB connection (runtime + migraciones): **Session pooler** `aws-1-us-east-1.pooler.supabase.com:5432`, user `postgres.xxouidlranxofewodztt`, con `?sslmode=no-verify`.

---

## ✅ RESUELTO

### 1. Build TypeScript del backend (commit `fca11e0`)
- **Síntoma:** errores TS en el build (`@prisma/client has no exported member 'Prisma'`, etc.) porque el cliente Prisma no estaba generado cuando `@vercel/node` corre `tsc`.
- **Fix:** `postinstall: prisma generate` en `apps/server/package.json` + agregado `@types/pg`. `engines.node` a `"24.x"`.

### 2. Crash total de la API — `FUNCTION_INVOCATION_FAILED` (commit `4c95215`)
- **Causa raíz (logs CLI sin truncar):** `Cannot find module '.../bcrypt/lib/binding/napi-v3/bcrypt_lib.node'`. El binario nativo de **bcrypt** no se incluye en la lambda porque **pnpm ignora los build scripts**.
- **Fix:** reemplazar `bcrypt` → **`bcryptjs`** (JS puro, API-compatible, hashes interoperables) en los 6 imports + `@types/bcryptjs`.

### 3. Drift de schema en `Category`
- **Síntoma:** `The column (not available) does not exist` en `prisma.category.findMany`.
- **Fix:** aplicadas migraciones `add_show_in_hero_to_category` / `add_show_in_menu_to_category` con `pnpm --filter @repo/server migrate:deploy`.

### 4. Credenciales / TLS de la DB en Vercel
- **Síntoma:** tras resetear la password en Supabase, la API daba `Authentication failed`, y luego `Error opening a TLS connection: self-signed certificate in certificate chain`.
- **Fix:** actualizar `DATABASE_URL` (prod) en Vercel con la nueva password y **`?sslmode=no-verify`** (el pooler de Supabase usa cert self-signed). Redeploy.

### 5. Drift de schema en `User` → login 500 (commit `7f1f5ea`)
- **Síntoma:** `prisma.user.findUnique()` → "column does not exist". La DB no tenía `refreshToken` / `refreshTokenExpires` (estaban en `schema.prisma` sin migración).
- **Fix:** migración `20260529000002_add_refresh_token_to_user` creada y aplicada.

### 6. La web no deployaba (estado `Error`) → servía versión vieja (commit `7f1f5ea`)
- **Causa raíz:** el `postinstall: prisma generate` (punto 1) corre en TODO `pnpm install`, incluido el build de `ecommerce-web` (que hace `cd ../.. && pnpm install`). Pero `prisma.config.ts` exigía `PRISMA_DATABASE_URL`/`DATABASE_URL`, que NO existen en el entorno de la web → `PrismaConfigEnvError` → install falla → web no deploya.
- **Fix:** `prisma.config.ts` cae a un placeholder `postgresql://placeholder...` si no hay credenciales (`prisma generate` no necesita conexión).

### 7. CORS
- **Falsa alarma.** El origin real `https://ecommerce-web-three-alpha.vercel.app` está permitido. Verificado: preflight `OPTIONS` con header `authorization` contra `ecommerce-api-dun.vercel.app` → **204** con `Access-Control-Allow-Origin` correcto y `Access-Control-Allow-Headers: authorization`. El "Not allowed by CORS" que apareció antes era por un origin de prueba falso.

---

## ⛔ PENDIENTE / SIN RESOLVER

### A. Post-login: no se puede entrar a panel/perfil/checkout ("error de token") — ✅ RESUELTO (sesión 2026-06-07)

**Causa raíz:** `apps/web/proxy.ts` (middleware de Next 15.5, equivalente a `middleware.ts`) leía una cookie `token` que **nunca existe en el dominio de la web**. El front guarda el JWT en `localStorage` (key `auth_token`, ver `apiClient.ts`) y lo manda como `Bearer`. El backend sí setea la cookie `token`, pero en el dominio de la **API** (`ecommerce-api-dun.vercel.app`) — cross-domain, así que no viaja al dominio de la web (`ecommerce-web-three-alpha`). El middleware server-side no puede leer `localStorage` → `token` siempre `undefined` → redirect infinito a `/login?redirect=...`. Por eso server-side respondía 200 pero la navegación expulsaba.

**Fix:**
- Eliminado `apps/web/proxy.ts`.
- Nuevo `apps/web/src/components/auth/ProtectedRoute.tsx`: guard de cliente reutilizable (auth + rol + preserva `?redirect=`).
- Aplicado en `app/superadmin/layout.tsx` (SUPERADMIN), `app/admin/layout.tsx` (ADMIN/SUPERADMIN, antes **sin guard**), `app/(profile)/layout.tsx` (CLIENT/ADMIN/SUPERADMIN, antes **sin guard**). `checkout` ya se auto-protegía.
- `UserProvider` gatea children tras `!isLoading` (espera `checkAuth`), así que `isAuthenticated` es confiable al renderizar los layouts. La seguridad real la dan los endpoints con `Bearer` + `role.middleware.ts`; el guard de cliente es solo UX. Patrón correcto para SPA con API en otro dominio.

---

#### Notas de diagnóstico original (histórico)

**Estado:** EL BACKEND FUNCIONA. Verificado contra producción (`ecommerce-api-dun` y alias git-main):

- `POST /api/auth/register` → 200, devuelve token.
- `POST /api/auth/login` → 200, devuelve `data.token`.
- `GET /api/auth/session` con `Authorization: Bearer <token>` → `{ authenticated: true }`.
- `GET /api/users/profile` con Bearer → 200.
- Preflight CORS con `authorization` → 204 OK.

**Flujo del front (revisado):**
- `apps/web/src/lib/apiClient.ts`: `tokenStore` usa key `auth_token` en localStorage; `apiFetch` agrega `Authorization: Bearer <token>` y `credentials: 'include'`. En 401 intenta `attemptRefresh()` vía `POST /auth/refresh` (cookies); si falla, **borra el token** y dispara `auth:session-expired`.
- `apps/web/src/store/UserContext.tsx` + `user-context/UserContext.hooks.ts`: en mount corre `checkAuth()` → `fetchAuthSession()` → `apiFetch('/auth/session')`. Si no `authenticated`, `setUser(null)`.
- `ProfilePageClient.tsx` (y orders/checkout): si `!isAuthenticated` → `router.push('/login')`.
- NO hay `middleware.ts` en la web.

**Descartado:**
- ❌ Token viejo/stale: el usuario cerró sesión, confirmó que `auth_token` se borró del localStorage, volvió a loguear fresco y **sigue fallando**.
- ❌ CORS (verificado OK, incluido preflight con `authorization`).
- ❌ `NEXT_PUBLIC_API_URL` mal (apunta correcto a `…-dun.vercel.app/api`).
- ❌ Backend / JWT (un token recién emitido valida y devuelve perfil 200).

**Hipótesis a investigar la próxima:**
1. **Capturar en el navegador** (DevTools) qué request falla al entrar a Perfil: status + Response de `…/api/auth/session` (y/o `/users/profile`), y errores de Console. ESTE ES EL DATO QUE FALTA — no se pudo reproducir con curl porque server-side todo responde bien.
2. Revisar si la request de `apiFetch` realmente lleva el header `Authorization` en el navegador (¿`tokenStore.get()` devuelve null por timing/SSR en algún punto? `checkAuth` corre en `useEffect`, debería tener `window`).
3. Revisar `attemptRefresh`: si `/auth/session` devuelve 401 por cualquier motivo transitorio, `apiClient` **borra el token** y saca al usuario. Confirmar que no haya un 401 espurio (ej. race con el render, doble request, o `credentials: 'include'` mezclando cookie ausente).
4. Confirmar que el deployment de producción de la web servido al usuario es efectivamente el último build Ready (no un alias apuntando a un build viejo).
5. Revisar `getSession` / `/auth/refresh` handlers del backend por si el front entra al camino de refresh y rompe.

### B. Ruido de errores TypeScript en el build de `@vercel/node` (cosmético, NO bloqueante)

- **Síntoma:** ~300 errores TS en cada build del API (`@prisma/client has no exported member`, `Property 'post' does not exist on type 'Router'`, `Request`/`Response` sin sus métodos, etc.). El deploy igual queda **READY** y el runtime funciona (todos los endpoints responden 200).
- **Por qué:** el `tsc` de `@vercel/node` resuelve los `@types` distinto al entorno local (donde `tsc --noEmit` pasa limpio). Son de dos familias: Prisma (cliente generado en el store hasheado de pnpm) y Express 5 (augmentación de `@types/express`/`@types/express-serve-static-core` no resuelve en el layout de Vercel).
- **Importante:** el "fix definitivo" de mover Prisma a `src/generated/prisma` SOLO eliminaría la mitad Prisma; los de Express seguirían. No vale la pena el riesgo solo por estética.
- **Pendiente a investigar:** cómo deshabilitar/forzar el typecheck de `@vercel/node`, o alinear la resolución de `@types` (¿hoisting de pnpm? ¿`tsconfig` con `types`/`typeRoots`?). Tarea aparte.

---

## Notas operativas (cómo trabajamos esto)

- **Logs runtime sin truncar:** `npx vercel logs <url> --json` (el MCP de Vercel trunca el mensaje en la tabla).
- **Drift completo Prisma 7:** `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` (los flags `--from-url` fueron removidos en v7).
- **Conexión a Supabase desde local/Vercel:** usar **session pooler** (5432, IPv4). La conexión directa `db.<ref>.supabase.co:5432` es **IPv6-only** → `P1001` desde redes IPv4. Transaction pooler (6543) NO sirve para migraciones.
- **`prisma generate` no debe depender de credenciales:** en monorepos un `postinstall` corre en todos los proyectos al instalar.
- **Migraciones a prod:** `pnpm --filter @repo/server migrate:deploy` (lee `PRISMA_DATABASE_URL` de `apps/server/.env`; el `.env` está gitignored).
- **Seguridad pendiente:** se compartió la password de la DB en el chat de debugging → conviene resetearla y actualizar `DATABASE_URL` en Vercel. Quedaron 3 usuarios de prueba `test_*@test.com` en la DB de prod.
