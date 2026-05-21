# Patrones de Implementación

## Resumen

Este documento define cómo trabajar en el proyecto: flujo de ramas, commits, PRs, consistencia de entorno, estructura de componentes y reglas para el agente de IA. Complementa `CONTRIBUTING.md` (que tiene el detalle de comandos git) con criterios de decisión y reglas de calidad.

---

## 1. Flujo de ramas

El historial debe ser legible. La regla general es **una rama por tipo de trabajo**, no una rama por tarea individual.

| Cuándo crear rama nueva | Cuándo continuar en la misma |
|---|---|
| El trabajo es de un tipo diferente (feat vs fix) | Tareas pequeñas del mismo tipo y área |
| Afecta un área diferente del código | Ajustes relacionados al mismo feature |
| El PR anterior ya fue mergeado | — |

Todas las ramas parten de `develop`. Nunca trabajar directamente en `develop` ni en `main`.

Ver `CONTRIBUTING.md` para los prefijos y comandos git completos.

---

## 2. Commits

Formato obligatorio: `<tipo>: <descripción en minúsculas y español>`

```
feat: agrega filtro por estado en tabla de órdenes
fix: corrige cálculo de descuento con cupón combinado
refactor: extrae lógica de paginación a hook usePagination
chore: actualiza prisma a v7.1
docs: documenta variables de entorno del backend
```

Reglas:
- El mensaje describe **qué** cambió, no **cómo**.
- Un commit = un cambio cohesivo. No acumular cambios no relacionados.
- No commitear archivos `.env` ni secrets bajo ninguna circunstancia.

---

## 3. Pull Requests

### Flujo

```
rama feat/* o fix/*  →  PR a develop  →  (cuando está estable)  PR develop a main
```

- Cada PR a `main` desencadena un deploy en Vercel (producción). No mergear a `main` sin validar en `develop` primero.
- PRs preferiblemente con **Squash and merge** para historial limpio.
- Borrar la rama después del merge (tanto local como remota).

### Cuándo crear un PR

- El feature o fix está funcionalmente completo (no roto).
- Los cambios fueron probados manualmente al menos en el happy path.
- No hay `console.log` de debug ni código comentado.

---

## 4. Reglas para el agente de IA

El agente **no commitea ni pushea sin confirmación explícita**. Un feature puede estar implementado pero no ser funcional hasta que otras partes estén listas; el agente no puede asumir que algo está listo para commit.

Protocolo del agente:
1. Implementa los cambios.
2. Pregunta: "¿Confirmás que esto está listo para commitear?"
3. Solo al recibir confirmación: crea el commit con el formato estándar.
4. Nunca hacer `git push` sin que el usuario lo pida explícitamente.

---

## 5. Variables de entorno

Cada vez que se trabaja con una API key, secret o URL de servicio, verificar consistencia entre todos los archivos de entorno del proyecto.

### Checklist de consistencia

- [ ] `apps/web/.env.local` — variables del frontend
- [ ] `apps/web/.env.example` — actualizado con las nuevas variables (sin valores reales)
- [ ] `apps/server/.env` — variables del backend
- [ ] `CLAUDE.md` — tabla de variables actualizada

**Regla:** si se agrega una variable nueva, los cuatro puntos anteriores deben actualizarse en el mismo commit o PR.

Variables que deben coincidir entre frontend y backend:

| Frontend | Backend | Descripción |
|---|---|---|
| `REVALIDATE_SECRET` | `STOREFRONT_REVALIDATE_SECRET` | Deben ser el mismo valor |

---

## 6. Estructura de componentes

Antes de crear un componente nuevo, revisar los componentes vecinos de la misma sección. El estándar es **dot notation** sobre el nombre de la página, con responsabilidades separadas:

```
OrdersPageClient.tsx        ← componente raíz (cliente)
OrdersPage.table.tsx        ← tabla de datos
OrdersPage.filters.tsx      ← filtros y búsqueda
OrdersPage.header.tsx       ← título y acciones de página
OrdersPage.skeleton.tsx     ← estado de carga
OrdersPage.types.ts         ← tipos TypeScript de la página
OrdersPage.utils.ts         ← helpers y transformaciones
```

Reglas:
- No poner toda la lógica en un solo archivo. Si el componente supera ~150 líneas, es señal de que necesita dividirse.
- Los componentes reutilizables entre secciones van en `components/admin/shared/`.
- Siempre definir `interface` de props explícita (nunca inline types en el parámetro).

---

## 7. Consistencia del schema de Prisma

Cada vez que se modifica el schema (`apps/server/prisma/schema.prisma`), verificar:

- [ ] Ejecutar `pnpm prisma migrate dev` con un nombre descriptivo para la migración.
- [ ] Verificar que los tipos TypeScript generados (`prisma generate`) estén actualizados.
- [ ] Si se cambia un campo que ya tiene datos en producción, evaluar si la migración es destructiva.
- [ ] Los nombres de modelos y campos siguen `PascalCase` (modelos) y `camelCase` (campos), igual que el estándar de Prisma.

---

## 8. Checklist antes de abrir un PR

- [ ] El código compila sin errores TypeScript (`pnpm typecheck`).
- [ ] Las rutas nuevas del backend tienen su middleware de autenticación si son protegidas.
- [ ] Las variables de entorno nuevas están documentadas (ver sección 5).
- [ ] No hay `any` sin justificación explícita.
- [ ] Los estados de carga y error están cubiertos (no solo el happy path).
- [ ] El componente nuevo sigue la estructura dot notation si aplica.

---

## 9. Sistema de loading

### Capas de loading

El proyecto usa dos capas de loading separadas con propósitos distintos:

| Capa | Archivo | Cuándo se muestra |
|------|---------|-------------------|
| **Navegación** (route-level) | `loading.tsx` en cada carpeta de ruta | Al navegar hacia la página (Next.js Suspense automático) |
| **Datos en cliente** | Estado `loading` interno del componente | Después que el JS carga y el componente hace fetch por useEffect |
| **Streaming de servidor** | Suspense boundary en el server component | Mientras un server component async resuelve su fetch |

### Componentes compartidos

**`@/components/admin/shared/AdminSectionLoadingSpinner`** — spinner de carga inline dentro de una sección de contenido. Acepta:

```tsx
<AdminSectionLoadingSpinner label="Cargando clientes..." />
```

Usar en: cualquier componente cliente que hace fetch en `useEffect` y necesita mostrar estado de carga en el área de datos. No usar en botones ni acciones (esos usan `Loader2` directo).

**`@/components/admin/shared/AdminTableBodySkeleton`** — skeleton de solo la tabla (sin header ni filtros). Usar como fallback de Suspense o loading interno cuando el header ya está visible en pantalla:

```tsx
<AdminTableBodySkeleton columns={7} rows={5} />
```

**`@/components/admin/shared/AdminTablePageLoading`** — skeleton de página completa (header + stats + filtros + tabla). Solo usar en los archivos `loading.tsx` de ruta (Next.js navigation loading), nunca dentro de un componente. Acepta:

```tsx
<AdminTablePageLoading
    columns={7}       // número de columnas de la tabla
    rows={5}          // filas de placeholder (default: 5)
    hasStats={3}      // 0 | 3 | 4 — muestra tarjetas de stats arriba
    hasTabs           // agrega fila de tabs (ej: pedidos)
/>
```

### Inventario de loading.tsx

| Ruta | Archivo | Componente | Variante |
|------|---------|------------|----------|
| `/admin` (fallback) | `app/admin/loading.tsx` | inline | dashboard |
| `/admin/dashboard` | `app/admin/dashboard/loading.tsx` | inline | dashboard |
| `/admin/products` | `app/admin/products/loading.tsx` | `AdminTablePageLoading` | tabla 7 cols |
| `/admin/orders` | `app/admin/orders/loading.tsx` | `AdminTablePageLoading` | tabla 6 cols + tabs |
| `/admin/categories` | `app/admin/categories/loading.tsx` | `AdminTablePageLoading` | tabla 5 cols |
| `/admin/customers` | `app/admin/customers/loading.tsx` | `AdminTablePageLoading` | tabla 7 cols + 3 stats |
| `/admin/marketing` | `app/admin/marketing/loading.tsx` | inline | 4 stats + grid de cards |
| `/admin/settings` | `app/admin/settings/loading.tsx` | inline | 2 form cards |
| `/catalog` | `app/catalog/loading.tsx` | inline | product grid |
| `/category/[slug]` | `app/category/[slug]/loading.tsx` | inline | product grid |
| `/product/[slug]` | `app/product/[slug]/loading.tsx` | inline | detalle de producto |
| `/(profile)` | `app/(profile)/loading.tsx` | inline | lista de filas |

### Reglas

- **No duplicar cuerpos**: si la sección tiene tabla, usar `AdminTablePageLoading`. Inline solo para layouts únicos (dashboard, marketing, settings).
- **El `loading.tsx` y el Suspense fallback interno deben usar el mismo componente**: evitar que el usuario vea dos skeletons distintos en la misma carga.
- **Los estados de carga cliente (useEffect)** siguen en el componente. Son una capa diferente que cubre refetches y cambios de filtro.

### Loading parcial implementado

El header y los filtros siempre son visibles; solo el área de datos muestra skeleton.

| Sección | Header visible durante carga | Skeleton de datos |
|---------|------------------------------|-------------------|
| Products | ✓ (`ProductsClientManager` fuera del Suspense) | `AdminTableBodySkeleton` |
| Orders | ✓ (siempre) | `AdminTableBodySkeleton` |
| Categories | ✓ (siempre) | `AdminSectionLoadingSpinner` en card |
| Customers | ✓ (siempre) | `AdminSectionLoadingSpinner` en card |
| Marketing | ✓ (siempre) | grid de cards pulse + `TriggersConfigCard` con su propio estado |
| Settings | ✓ (siempre) | `SettingsFormSkeleton` (inline en el componente) |
| Dashboard | ✓ (siempre) | `DashboardContentSkeleton` (inline en el componente) |

### Plan pendiente

- **Loading en la tienda pública**: agregar loading granular en páginas de producto, perfil y carrito (no solo el route-level loading.tsx que ya existe).

---

## 10. Ideas a considerar (backlog de mejoras)

- **Lint en pre-commit**: agregar `husky` + `lint-staged` para correr ESLint y Prettier automáticamente antes de cada commit.
- **Validación de tipos en CI**: agregar `pnpm typecheck` en el pipeline de GitHub Actions para bloquear merges con errores TypeScript.
- **Seed de base de datos**: documentar cómo restaurar el estado inicial de la BD en desarrollo para que cualquier dev pueda arrancar rápido.
- **Manejo de errores en el backend**: definir un formato estándar de respuesta de error (`{ error: string, code?: string }`) para que el frontend pueda manejarlos de forma uniforme.
- **Convención de nombres de migraciones de Prisma**: usar el formato `YYYYMMDD_descripcion` para que sean ordenadas cronológicamente.
- **Review de seguridad en PRs con auth**: cualquier cambio en middleware de autenticación o rutas protegidas debe pasar por revisión extra antes de mergear a main.
