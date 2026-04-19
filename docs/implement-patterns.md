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

## 9. Ideas a considerar (backlog de mejoras)

- **Lint en pre-commit**: agregar `husky` + `lint-staged` para correr ESLint y Prettier automáticamente antes de cada commit.
- **Validación de tipos en CI**: agregar `pnpm typecheck` en el pipeline de GitHub Actions para bloquear merges con errores TypeScript.
- **Seed de base de datos**: documentar cómo restaurar el estado inicial de la BD en desarrollo para que cualquier dev pueda arrancar rápido.
- **Manejo de errores en el backend**: definir un formato estándar de respuesta de error (`{ error: string, code?: string }`) para que el frontend pueda manejarlos de forma uniforme.
- **Convención de nombres de migraciones de Prisma**: usar el formato `YYYYMMDD_descripcion` para que sean ordenadas cronológicamente.
- **Review de seguridad en PRs con auth**: cualquier cambio en middleware de autenticación o rutas protegidas debe pasar por revisión extra antes de mergear a main.
