# Roadmap a Producto Profesional

> **Objetivo:** llevar el e-commerce JP DK al estado de "producto profesional" — valor de negocio (features que un cliente pagaría) **+** valor de portafolio (presentación que un reclutador o cliente potencial valore).
>
> **Fecha de auditoría:** 2026-05-21
> **Branch actual:** `main` (con 15 archivos modificados sin commitear)
> **Rama de trabajo recomendada:** `develop`

---

## Tabla de contenidos

1. [Diagnóstico actual](#1-diagnóstico-actual)
2. [Fase 0 — Estabilización](#fase-0--estabilización)
3. [Fase 1 — Valor de negocio](#fase-1--valor-de-negocio)
4. [Fase 2 — Valor de portafolio](#fase-2--valor-de-portafolio)
5. [Decisiones abiertas](#decisiones-abiertas)
6. [Métricas de éxito](#métricas-de-éxito)
7. [Bitácora de avance](#bitácora-de-avance)

---

## 1. Diagnóstico actual

### 1.1 Pagos — ❌ No hay pasarela real

**Problema:** el checkout crea la orden pero **no cobra**. Es un e-commerce sin cobro.

**Evidencia:**
- No hay dependencias de Stripe/MercadoPago/Webpay en `apps/server/package.json` ni `apps/web/package.json`.
- En `CheckoutPageClient.tsx`: `paymentMethod` se setea a `'mercadopago'` pero solo es estado de UI — nunca se usa para iniciar un cobro.
- `createOrderUseCase` (`apps/server/src/services/order/use-cases/create-order.ts`) crea la orden con `status: PENDING`, `isPaid: false`.
- `markOrderAsPaidUseCase` existe pero se llama manualmente desde el admin — **no hay webhook ni reconciliación automática**.
- El schema de Prisma no tiene campos para `paymentProvider`, `externalPaymentId`, `paymentStatus`.

**Solución requerida (greenfield):**
- Elegir proveedor (decisión abierta — ver §5).
- Extender schema: `paymentProvider`, `externalPaymentId`, `paymentStatus`, `paymentRawPayload` (auditoría).
- Backend: endpoint para crear preferencia/intent + endpoint de webhook con verificación de firma + idempotencia (deduplicación por `externalPaymentId`).
- Frontend: redirect a checkout del provider + callback URL + estado `processing` mientras se confirma webhook.
- Reintentos exponenciales para el webhook (provider los hace, pero hay que ser idempotente).
- Cron de reconciliación (fallback si el webhook nunca llega).

---

### 1.2 Emails (Resend) — ⚠️ Configurado, no funciona al 100%

**Problema reportado por el usuario:** "Resend no está funcionando al 100%".

**Estado del wiring:**

| Use-case | Disparador | Modo | Estado |
|---|---|---|---|
| `sendWelcomeEmail` | Registro de usuario | `sendSilent` | wireado |
| `sendPasswordResetEmail` | Forgot password | `send` (lanza error) | wireado |
| `sendOrderReceiptEmail` | `markOrderAsPaid` | `sendSilent` | wireado |
| `sendAbandonedCartEmail` | (solo use-case) | manual | ❌ sin disparador automático |
| `sendVipRewardEmail` | (solo use-case) | manual | ❌ sin disparador automático |
| `sendReviewRequestEmail` | (solo use-case) | manual | ❌ sin disparador automático |

**Causas probables del fallo:**

1. **`EMAIL_FROM_ADDRESS` cae al default `onboarding@resend.dev`** (ver `apps/server/src/services/email/email.service.ts:19`). Ese dominio de Resend **solo permite enviar a la dirección dueña de la API key**. Cualquier otro destinatario falla — y como `sendOrderReceipt` y `sendWelcome` usan `sendSilent`, el error se loguea y se silencia (el flow sigue como si todo bien).
2. **Dominio no verificado en Resend.** Sin DNS configurado (SPF/DKIM/DMARC), aunque cambies `EMAIL_FROM_ADDRESS`, los emails caen en spam o se rechazan.
3. **3 use-cases sin trigger automático** (abandoned-cart, vip-reward, review-request) — están listos pero nadie los llama.

**Solución requerida:**
- Verificar dominio propio en Resend + configurar SPF/DKIM/DMARC.
- Setear `EMAIL_FROM_ADDRESS` y `EMAIL_FROM_NAME` en Vercel envs.
- Reemplazar `sendSilent` por logging visible (mantener no-throw en checkout, pero alertar via Vercel logs / Sentry).
- Cron jobs en Vercel para los 3 use-cases pendientes:
  - `abandoned-cart`: corre cada 1h, busca carritos > 1h sin actividad.
  - `review-request`: corre diariamente, busca órdenes entregadas hace >7 días sin review.
  - `vip-reward`: ya se asigna en `createOrder` (`maybeAssignVipCoupon`), pero el email puede no estar disparándose — verificar.

---

### 1.3 SEO — ✅ Completado

**Lo único que existe:**
- `apps/web/app/layout.tsx`: metadata estática genérica (`title: "JP DK Streetwear"`, `description: "Streetwear E-commerce"`).
- `apps/web/app/icon.png`.
- `lang="es-CL"` (ok).

**Lo que falta (todo):**
- `app/sitemap.ts` — sitemap dinámico (productos, categorías, páginas estáticas).
- `app/robots.ts` — directivas para crawlers.
- `app/manifest.ts` — PWA-ready.
- `app/opengraph-image.tsx` — OG default + por producto.
- `generateMetadata` dinámico en:
  - `/product/[slug]` — title, description, OG, canonical, product:price meta.
  - `/category/[slug]` — title, description, OG.
- JSON-LD Schema.org:
  - `Product` con `offers`, `aggregateRating`, `brand`.
  - `BreadcrumbList`.
  - `Organization` + `WebSite` con `SearchAction`.

**Problema arquitectónico de fondo:**

Las páginas críticas para SEO (`/product/[slug]`, `/category/[slug]`, `/catalog`, `/`) son **componentes cliente** (`'use client'` en `ProductPageClient`, `CategoryPageClient`, etc.). Esto significa que el HTML que ve el crawler de Google **no tiene contenido** — solo el shell, y el JS lo hidrata después.

Para SEO real:
- Convertir `app/product/[slug]/page.tsx` y `app/category/[slug]/page.tsx` en **Server Components** que hagan el fetch del producto/categoría server-side y pasen los datos al client component como prop.
- Mantener el Client Component solo para interactividad (variantes, carrito, etc.).

---

### 1.4 Performance — ⚠️ Anti-patterns presentes

- `generateStaticParams` con `cache: 'no-store'` (`apps/web/app/product/[slug]/page.tsx:7`) — impide cualquier optimización en build.
- 0 uso de ISR (`export const revalidate = N`) en páginas de producto/categoría.
- Render principal cliente-side → mal TTFB y LCP.
- 5 `loading.tsx` recién agregados (untracked) — buena señal, pero sin commitear.
- Faltan auditorías de `<Image>` (sizes, priority, placeholder).

---

### 1.5 Portfolio readiness — ❌

| Activo | Estado |
|---|---|
| `README.md` en raíz | ❌ **No existe** — gap más grande para reclutadores |
| Demo URL pública | ❌ no listada |
| Screenshots / GIFs | ❌ |
| Diagrama de arquitectura | ❌ |
| `CLAUDE.md` | ✅ (interno) |
| `CONTRIBUTING.md` | ✅ (interno) |
| `docs/design-system.md` | ✅ activo aprovechable |
| `docs/implement-patterns.md` | ✅ activo aprovechable |

---

### 1.6 Deuda pendiente sin commitear — ⚠️ 15 archivos modificados

**No tiene sentido pilar features encima de esto sin entenderlo primero.**

| Archivo | Δ líneas | Probable contenido |
|---|---|---|
| `apps/web/proxy.ts` | +93 | Rework de proxy reverso (cookies cross-origin) |
| `apps/web/src/lib/apiClient.ts` | +65 | Cambios en cliente HTTP/JWT |
| `apps/server/src/services/auth.service.ts` | +55 | Lógica auth ampliada |
| `apps/server/src/controllers/user/handlers/auth.handlers.ts` | +48 | Handlers de auth nuevos |
| `apps/server/prisma/schema.prisma` | ±30 | Cambios de schema (requiere migración) |
| `apps/web/app/category/[slug]/page.tsx` | +17 | Cambios menores |
| `apps/web/app/product/[slug]/page.tsx` | +17 | Cambios menores |
| `apps/web/src/store/UserContext.tsx` | +8 | Cambios menores |
| `apps/web/src/lib/utils.ts` | +10 | Cambios menores |
| `apps/web/app/actions/auth.ts` | nuevo | Server Action |
| `apps/web/app/actions/revalidate.ts` | nuevo | Server Action de revalidación ISR |
| 5× `loading.tsx` | nuevos | Skeletons de ruta |
| `.npmrc` | borrado | Decidir si intencional |
| `docker/postgres/init/01-create-n8n-database.sql` | borrado | Decidir si intencional |
| `pnpm-lock.yaml` | regenerado | Dependencias agregadas/quitadas |

**Branch:** trabajo actual en `main` — esto **rompe la convención** de `CONTRIBUTING.md` (siempre desde `develop`).

---

## Fase 0 — Estabilización

> **Goal:** ningún cambio nuevo se hace encima de WIP no entendido. Cerrar todo lo pendiente, mergear a `develop`, validar que prod sigue funcionando.

### Checklist

- [ ] Revisar uno por uno los 15 archivos modificados, decidir: **commit, ajuste o discard**.
- [ ] Si `prisma/schema.prisma` cambió → generar migración con nombre descriptivo (`pnpm --filter @repo/server prisma migrate dev --name <descripcion>`).
- [ ] Validar que `app/actions/auth.ts` y `app/actions/revalidate.ts` están realmente usados (si no, decidir).
- [ ] Commitear los 5 `loading.tsx` (mejoran UX inmediato).
- [ ] Decidir destino de `.npmrc` borrado y `01-create-n8n-database.sql` borrado.
- [ ] Mover el trabajo a `develop` (si la convención del proyecto sigue siendo trunk `develop`).
- [ ] Smoke test end-to-end en producción tras merge: login → catálogo → carrito → checkout → orden creada.

### Salida

- Branch `develop` al día, prod estable, base limpia para construir encima.

---

## Fase 1 — Valor de negocio

> **Goal:** features que un cliente real pagaría por usar. Sin esto, no es un e-commerce — es un catálogo bonito.

### 1.A — Emails operativos (más rápido de cerrar)

- [ ] Verificar dominio propio en Resend (`jpdk.cl` o el que corresponda) + configurar SPF/DKIM/DMARC en el DNS.
- [ ] Setear `EMAIL_FROM_ADDRESS` y `EMAIL_FROM_NAME` en Vercel (producción + preview).
- [ ] Actualizar `apps/server/.env.example` con las nuevas vars.
- [ ] Reemplazar `sendSilent` por logging visible en órdenes y registro (no-throw, pero alertable).
- [ ] Crear Vercel Cron jobs:
  - `/api/cron/abandoned-cart` — corre cada 1h.
  - `/api/cron/review-request` — corre diariamente.
- [ ] Tests manuales: registro → recibe welcome | forgot-password → recibe reset | orden pagada → recibe receipt.

### 1.B — SEO foundation ✅

- [x] Convertir `app/product/[slug]/page.tsx` y `app/category/[slug]/page.tsx` a **Server Components**:
  - Fetch del producto/categoría server-side (sin `cache: 'no-store'`).
  - Pasar datos al `ProductPageClient` / `CategoryPageClient` como prop.
- [x] Implementar `generateMetadata` dinámico en ambas rutas.
- [x] Crear `app/sitemap.ts` dinámico (productos publicados + categorías + páginas estáticas).
- [x] Crear `app/robots.ts`.
- [x] Crear `app/manifest.ts`.
- [x] Crear `app/opengraph-image.tsx` (default).
- [x] Crear `app/product/[slug]/opengraph-image.tsx` (por producto).
- [x] JSON-LD: helper para `Product`, `BreadcrumbList`, `Organization`, `WebSite` en `src/lib/jsonld.ts`.
- [x] Setear `revalidate = 60` en producto/categoría.
- [ ] Validar con Google Rich Results Test + Lighthouse SEO ≥ 95.

### 1.C — Pasarela de pago

> **Decisión pendiente:** ver §5.

- [ ] Extender `prisma/schema.prisma`:
  ```prisma
  paymentProvider     String?    // 'mercadopago' | 'stripe' | null
  externalPaymentId   String?    @unique
  paymentStatus       PaymentStatus @default(PENDING)
  paymentRawPayload   Json?
  ```
- [ ] Migración Prisma.
- [ ] `POST /api/payments/create-preference` — crea preferencia/intent.
- [ ] `POST /api/payments/webhook` — recibe confirmación, verifica firma, marca orden como pagada (idempotente).
- [ ] Frontend: en `handlePayment`, después de `createOrder`, redirigir a la URL del provider.
- [ ] Callback URLs: `/checkout/success`, `/checkout/failure`, `/checkout/pending`.
- [ ] Cron de reconciliación: cada 30min revisa órdenes `processing` > 1h y consulta al provider.
- [ ] Tests con sandbox del provider antes de prod.

### 1.D — Performance ✅

- [x] Reemplazar `cache: 'no-store'` por estrategia de ISR en `generateStaticParams` (resuelto en 1.B — ambas páginas usan `revalidate: 60`).
- [x] Auditar uso de `next/image` — `ProductCard.image.tsx` y thumbnails de `ProductPage.gallery.tsx` convertidos a `<Image fill sizes=...>`. `next.config.js` configurado con `remotePatterns` para Supabase.
- [x] Lazy load del CartDrawer (framer-motion) con `next/dynamic({ ssr: false })` en `AppLayout.tsx`.
- [x] `loading.tsx` verificado: cubre todas las rutas lentas. Agregado `app/checkout/loading.tsx` (faltaba). Quitado `'use client'` innecesario de `app/catalog/page.tsx`.
- [ ] Target: Lighthouse Performance ≥ 90 — pendiente auditoría real.

---

## Fase 2 — Valor de portafolio

> **Goal:** que cualquiera que abra el repo o el sitio entienda en 30s qué es, qué resuelve y por qué está bien hecho.

### 2.A — README profesional

- [ ] Crear `README.md` en raíz con:
  - Headline: una línea de qué es.
  - Demo URL + badge.
  - Screenshot/GIF del flujo principal (tienda → checkout).
  - Stack table.
  - Features destacadas (auth JWT cross-origin, pasarela con webhooks idempotentes, panel admin, automatización VIP/abandoned cart, multi-rol).
  - Arquitectura (diagrama Mermaid: web ↔ server ↔ Prisma ↔ Supabase, + Resend + provider de pago).
  - Setup local (variables, comandos, migración).
  - Decisiones técnicas notables (sección "Why X over Y").
  - Roadmap visible.

### 2.B — Pruebas de calidad

- [ ] Tests E2E críticos con Playwright: login, agregar al carrito, checkout completo.
- [ ] Tests unitarios en helpers de negocio (cálculo de descuentos, envíos, totales).
- [ ] CI: GitHub Actions corriendo lint + typecheck + tests en cada PR.

### 2.C — Observabilidad / hardening

- [ ] Sentry (frontend + backend) — captura errores reales.
- [ ] Rate limiting en endpoints críticos (login, register, forgot-password, webhook).
- [ ] Security headers (CSP, HSTS, X-Frame-Options) en `next.config` o middleware.
- [ ] Logs estructurados en backend (pino o similar).

### 2.D — Presentación

- [ ] Screenshots: home, catálogo, producto, carrito, checkout, panel admin (orders + dashboard), email recibido.
- [ ] GIF de 20s del flujo de compra completo.
- [ ] (Opcional) Loom o video corto explicando arquitectura.

---

## Decisiones abiertas

| # | Decisión | Opciones | Estado |
|---|---|---|---|
| 1 | **Proveedor de pago** | MercadoPago (mejor LATAM, alineado con código actual) / Stripe (mejor DX, más portfolio) / Ambos con strategy pattern | **Pendiente** |
| 2 | **Branch principal de trabajo** | `develop` (CONTRIBUTING.md) o `main` (estado actual) | Pendiente confirmar |
| 3 | **Cobertura de tests target** | Solo E2E críticos / + unit de helpers / + integración de API | Pendiente |
| 4 | **Sentry vs Vercel logs only** | Sentry agrega valor portfolio pero suma complejidad | Pendiente |
| 5 | **Dominio para Resend** | ¿Hay dominio comprado? ¿Cuál? | Pendiente |
| 6 | **Schema cambios actuales** | ¿Qué hace el diff de `schema.prisma`? Necesario revisar en Fase 0 | Pendiente |

---

## Métricas de éxito

Al cerrar el roadmap completo, el proyecto debería cumplir:

**Negocio:**
- [ ] Una compra real end-to-end: navegación → carrito → checkout → pago real → email recibido → estado actualizado.
- [ ] Admin puede ver la orden marcada como pagada automáticamente vía webhook.
- [ ] Sistema de cupones funciona en compra real.
- [ ] Email de bienvenida, reset, recibo, abandoned cart, review request — los 5 disparan.

**Portfolio:**
- [ ] Lighthouse: Performance ≥ 90, SEO ≥ 95, Accessibility ≥ 90, Best Practices ≥ 90.
- [ ] README abierto en GitHub se entiende sin abrir código.
- [ ] Demo URL funcional, navegable sin caerse.
- [ ] Screenshots/GIF en el README.
- [ ] CI verde en `main` y `develop`.
- [ ] Cero secrets commiteados.

---

## Bitácora de avance

> Actualizar al cerrar cada paso. Una línea por entrada: fecha · qué se hizo · commit o PR.

| Fecha | Fase | Acción | Ref |
|---|---|---|---|
| 2026-05-21 | — | Auditoría inicial y creación de roadmap | `docs/roadmap-produccion.md` |
| 2026-05-21 | 1.B ✅ | SEO foundation completo — 11 archivos creados/modificados. Detalle: `app/sitemap.ts` (dinámico), `app/robots.ts`, `app/manifest.ts` (PWA), `app/opengraph-image.tsx` (OG default), `app/product/[slug]/opengraph-image.tsx` (OG por producto), `src/lib/jsonld.ts` (helpers JSON-LD), páginas `/product/[slug]` y `/category/[slug]` convertidas a Server Components con `generateMetadata` + `revalidate=60` + JSON-LD incrustado, `ProductPageClient` y `CategoryPageClient` actualizados para recibir datos iniciales del servidor. Pendiente: validar con Google Rich Results Test + Lighthouse. | — |
| 2026-05-21 | 1.D ✅ | Performance: `next/image` en `ProductCard.image.tsx` y `ProductPage.gallery.tsx` (thumbnails con `fill`+`sizes`, `priority` en index 0); `remotePatterns` en `next.config.js`; CartDrawer lazy-loaded con `next/dynamic({ ssr: false })`; `'use client'` quitado de `app/catalog/page.tsx`; `app/checkout/loading.tsx` creado. | — |
