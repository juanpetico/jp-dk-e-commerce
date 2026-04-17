# n8n — Automatización de Marketing y Fidelización

Orquestador de flujos locales para **carrito abandonado**, **acceso VIP** y **solicitud de reseñas**.
n8n corre en Docker y habla con el backend de Express vía endpoints internos protegidos por API key.

---

## Arquitectura

```
┌─────────────────┐    HTTP + x-internal-api-key     ┌──────────────────┐
│  n8n (Docker)   │ ───────────────────────────────► │  Backend Express │
│  :5678          │                                   │  :5001           │
│                 │   GET  /api/automation/*          │                  │
│  Cron triggers  │   POST /api/automation/*/notify   │  + Resend email  │
└─────────────────┘                                   └──────────────────┘
         │                                                      │
         └─ Persistencia ──► postgres (n8n_db)  ◄── postgres (ecommerce_db)
```

- **n8n** maneja *cuándo* ejecutar cada flujo (cron) y *orquesta* la lista-y-notifica.
- **Backend** implementa la lógica: consulta candidatos, valida idempotencia (`reminderSentAt`, `reviewRequestedAt`, `UserCoupon` existente), arma el email con templates existentes y lo envía con Resend.
- Ambos servicios comparten la red Docker `ecommerce-network`.

---

## Setup inicial

### 1. Variables de entorno

**Raíz del proyecto** (`.env` — usado por docker-compose):
```bash
cp .env.example .env
```

Edita y define valores únicos:
- `N8N_BASIC_AUTH_USER` / `N8N_BASIC_AUTH_PASSWORD` — protege la UI de n8n.
- `N8N_ENCRYPTION_KEY` — clave que n8n usa para cifrar credenciales guardadas. **No la cambies después** o perderás las credenciales.
- `INTERNAL_API_KEY` — clave compartida con el backend.

**Backend** (`apps/server/.env`):
```bash
INTERNAL_API_KEY="<mismo valor que .env de la raíz>"
```

### 2. Levantar servicios

```bash
docker-compose up -d
```

En el primer arranque:
- El script `docker/postgres/init/01-create-n8n-database.sql` crea automáticamente la BD `n8n_db`.
- n8n corre sus propias migraciones dentro de `n8n_db`.

### 3. Aplicar la migración Prisma (tracking de notificaciones)

Campos nuevos: `Cart.reminderSentAt`, `Order.reviewRequestedAt`.

```bash
cd apps/server
pnpm --filter server exec prisma migrate deploy
pnpm --filter server exec prisma generate
```

### 4. Acceder a n8n

- URL: http://localhost:5678
- Login: el que definiste en `.env` (default `admin` / `admin123`)

---

## Importar los workflows

Los 3 workflows preconfigurados están en `n8n/workflows/`.

En la UI de n8n:

1. **Workflows → tres puntos (⋯) → Import from file**
2. Sube uno por uno:
   - `01-abandoned-cart.json` — cada 2 horas escanea carritos inactivos hace 24 h y manda email.
   - `02-vip-access.json` — diario 09:00 (Santiago) otorga cupón VIP a usuarios que cruzaron `vipThreshold` (compra acumulada).
   - `03-review-requests.json` — diario 11:00 solicita reseña de pedidos entregados hace 7+ días.
3. Abre cada workflow → toggle **Active** en la esquina superior derecha.

Los nodos HTTP ya leen `BACKEND_API_URL` e `INTERNAL_API_KEY` desde las variables de entorno del contenedor (configuradas en `docker-compose.yml`). No hace falta setear credenciales manualmente.

---

## Endpoints expuestos por el backend

Todos requieren header `x-internal-api-key: <INTERNAL_API_KEY>`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET  | `/api/automation/abandoned-carts?hoursInactive=24&limit=50` | Carritos con items, updatedAt > N horas, sin `reminderSentAt`. |
| POST | `/api/automation/abandoned-carts/:cartId/notify`            | Envía email + marca `reminderSentAt`. Falla con 409 si ya se notificó. |
| GET  | `/api/automation/vip-candidates?limit=100`                  | Usuarios con gasto histórico pagado ≥ `vipThreshold` sin cupón VIP asignado. |
| POST | `/api/automation/vip-candidates/:userId/grant`              | Asigna cupón VIP + envía email. Idempotente. |
| GET  | `/api/automation/review-requests?daysSinceDelivery=7`       | Pedidos DELIVERED, updatedAt > N días, sin `reviewRequestedAt`. |
| POST | `/api/automation/review-requests/:orderId/notify`           | Envía email de reseña + marca `reviewRequestedAt`. |

### Probar manualmente con curl

```bash
# Listar carritos abandonados
curl -H "x-internal-api-key: $INTERNAL_API_KEY" \
  "http://localhost:5001/api/automation/abandoned-carts?hoursInactive=24"

# Notificar un carrito específico
curl -X POST -H "x-internal-api-key: $INTERNAL_API_KEY" \
  "http://localhost:5001/api/automation/abandoned-carts/<cartId>/notify"
```

---

## Lógica de idempotencia

| Flujo | Cómo evitamos re-envíos |
|-------|------------------------|
| Carrito abandonado | `Cart.reminderSentAt` queda con timestamp; el scanner lo excluye. Si el usuario actualiza el carrito, `updatedAt` cambia pero `reminderSentAt` no — para re-enviar, sería necesario limpiarlo manualmente o agregar lógica de "expiración". |
| Acceso VIP | Se consulta `UserCoupon` con el `vipCouponCode` de `StoreConfig`. Si ya está asignado, no se envía email. |
| Reseñas | `Order.reviewRequestedAt` queda con timestamp. |

---

## Tuning

Las ventanas (`hoursInactive`, `daysSinceDelivery`) se configuran directamente en los parámetros de la URL dentro del nodo HTTP del workflow. Abre el nodo "Listar …" y edita la query string.

Para mover la VIP a cadencia semanal, cambia el cron del workflow `02-vip-access.json` (por ejemplo `0 9 * * MON`).

---

## Troubleshooting

**n8n no puede alcanzar el backend (ECONNREFUSED).**
El backend corre fuera de Docker (en el host). El compose ya inyecta `BACKEND_API_URL=http://host.docker.internal:5001` y mapea `host.docker.internal` → `host-gateway`. Verifica que el backend esté corriendo en `:5001`.

**401 Unauthorized desde n8n.**
El `INTERNAL_API_KEY` de `apps/server/.env` no coincide con el del `.env` raíz. Reinicia ambos: `docker-compose restart n8n` y el backend.

**Los emails no se envían.**
Verifica `RESEND_API_KEY` en `apps/server/.env`. Los endpoints `*/notify` usan el mismo `emailService` que el resto del sistema.

**Olvidé la `N8N_ENCRYPTION_KEY`.**
Las credenciales guardadas en n8n quedan inaccesibles. Solución: `docker-compose down -v` (destruye el volumen `n8n_data`) y reimporta workflows. En producción, respalda la llave.

---

## Archivos relacionados

- `docker-compose.yml` — servicio `n8n` con healthcheck y volumen persistente.
- `docker/postgres/init/01-create-n8n-database.sql` — crea `n8n_db`.
- `n8n/workflows/*.json` — 3 workflows preconfigurados.
- `apps/server/src/routes/automation.routes.ts` — enrutador protegido.
- `apps/server/src/controllers/automation.controller.ts` — validación de inputs.
- `apps/server/src/services/automation/` — lógica de los 3 flujos.
- `apps/server/src/services/email/templates/{abandoned-cart,vip-reward,review-request}.template.ts` — emails branded.
- `apps/server/src/middleware/internal-api.middleware.ts` — validación de `x-internal-api-key`.
- `apps/server/prisma/migrations/20260417090000_add_automation_tracking/` — migración.
