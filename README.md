# 🛒 E-Commerce Platform - Documentación Técnica

## 📋 Tabla de Contenidos

- [Visión General](#-visión-general)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Base de Datos](#️-base-de-datos)
- [Módulos del Sistema](#-módulos-del-sistema)
- [API Endpoints](#-api-endpoints)
- [Configuración](#-configuración)
- [Instalación y Uso](#-instalación-y-uso)
- [Seguridad](#-seguridad)
- [Docker](#-docker)
- [Próximos Pasos](#-próximos-pasos)

---

## 🎯 Visión General

Esta es una plataforma de e-commerce completa construida con **Express.js**, **Prisma ORM** y **PostgreSQL**. El sistema proporciona una API REST robusta con autenticación JWT, autorización basada en roles (ADMIN/CLIENT), y operaciones CRUD completas para gestionar usuarios, categorías, productos y órdenes.

### Características principales

✅ **Autenticación y Autorización**: Sistema JWT con hash bcrypt y control de acceso basado en roles  
✅ **Gestión de Productos**: CRUD completo con imágenes, filtrado avanzado y generación automática de slugs SEO  
✅ **Sistema de Órdenes**: Transacciones seguras con control automático de stock y ciclo de vida completo  
✅ **Validación Robusta**: Validación de requests con express-validator  
✅ **Manejo de Errores**: Sistema centralizado de manejo de errores con respuestas consistentes  
✅ **TypeScript**: Código completamente tipado sin errores de compilación  
✅ **Docker**: Infraestructura containerizada con PostgreSQL y pgAdmin4

---

## 🛠️ Tecnologías

### Backend Core
- **Node.js** con **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **Prisma ORM** - Object-Relational Mapping
- **PostgreSQL** - Base de datos relacional

### Autenticación y Seguridad
- **jsonwebtoken** - Tokens JWT
- **bcrypt** - Hash de contraseñas
- **express-validator** - Validación de requests

### DevOps
- **Docker & Docker Compose** - Containerización
- **ts-node-dev** - Hot reload en desarrollo
- **dotenv** - Gestión de variables de entorno

---

## 🏛️ Arquitectura

El proyecto sigue una arquitectura de capas bien definida:

```
┌─────────────────────────────────────┐
│         Controllers Layer           │  ← Manejo de HTTP requests/responses
├─────────────────────────────────────┤
│          Services Layer             │  ← Lógica de negocio
├─────────────────────────────────────┤
│       Prisma ORM (Data Layer)       │  ← Acceso a datos
├─────────────────────────────────────┤
│          PostgreSQL DB              │  ← Almacenamiento
└─────────────────────────────────────┘
```

### Estructura de Directorios

```
apps/server/
├── src/
│   ├── config/
│   │   └── prisma.ts              # Cliente Prisma singleton
│   ├── middleware/
│   │   ├── auth.middleware.ts     # Autenticación JWT
│   │   ├── role.middleware.ts     # Autorización por roles
│   │   └── error-handler.ts       # Manejo global de errores
│   ├── services/
│   │   ├── auth.service.ts        # Lógica de autenticación
│   │   ├── user.service.ts        # Lógica de usuarios
│   │   ├── category.service.ts    # Lógica de categorías
│   │   ├── product.service.ts     # Lógica de productos
│   │   └── order.service.ts       # Lógica de órdenes
│   ├── controllers/
│   │   ├── user.controller.ts     # Handlers de usuarios
│   │   ├── category.controller.ts # Handlers de categorías
│   │   ├── product.controller.ts  # Handlers de productos
│   │   └── order.controller.ts    # Handlers de órdenes
│   ├── routes/
│   │   ├── user.routes.ts         # Rutas de usuarios
│   │   ├── category.routes.ts     # Rutas de categorías
│   │   ├── product.routes.ts      # Rutas de productos
│   │   └── order.routes.ts        # Rutas de órdenes
│   ├── utils/
│   │   └── request.ts             # Utilidades para requests
│   └── index.ts                   # Servidor principal
├── prisma/
│   └── schema.prisma              # Esquema de base de datos
├── .env                           # Variables de entorno
└── docker-compose.yml             # Configuración Docker
```

---

## 🗄️ Base de Datos

### Esquema Prisma

El sistema utiliza **Prisma ORM** con PostgreSQL. El esquema incluye:

#### Enums

```prisma
enum Role {
  CLIENT  // Usuario regular
  ADMIN   // Administrador
}

enum Size {
  S, M, L, XL, XXL
}

enum OrderStatus {
  PENDING    // Orden creada
  PAID       // Pagada
  SHIPPED    // Enviada
  DELIVERED  // Entregada
  CANCELLED  // Cancelada
}
```

#### Modelos Principales

**User** - Usuarios del sistema
- `id`, `email` (único), `password` (hasheado), `name`, `role`
- Relación: Un usuario puede tener múltiples órdenes

**Category** - Categorías de productos
- `id`, `name` (único), `slug` (único, generado automáticamente)
- Relación: Una categoría puede tener múltiples productos

**Product** - Productos de la tienda
- `id`, `name`, `slug`, `description`, `price`, `stock`, `sizes[]`, `isNew`, `categoryId`
- Relaciones: 
  - Pertenece a una categoría
  - Tiene múltiples imágenes
  - Puede estar en múltiples órdenes

**ProductImage** - Imágenes de productos
- `id`, `url`, `productId`
- Relación: Pertenece a un producto

**Order** - Órdenes de compra
- `id`, `userId`, `total`, `status`, `isPaid`, `paidAt`
- Relaciones:
  - Pertenece a un usuario
  - Contiene múltiples items

**OrderItem** - Items de las órdenes
- `id`, `orderId`, `productId`, `quantity`, `price`, `size`
- Relaciones:
  - Pertenece a una orden
  - Referencia a un producto

### Relaciones del Esquema

```mermaid
erDiagram
    USER ||--o{ ORDER : "realiza"
    CATEGORY ||--o{ PRODUCT : "contiene"
    PRODUCT ||--o{ PRODUCT_IMAGE : "tiene"
    ORDER ||--o{ ORDER_ITEM : "incluye"
    PRODUCT ||--o{ ORDER_ITEM : "referenciado_en"
    
    USER {
        int id PK
        string email UK
        string password
        string name
        enum role
    }
    
    CATEGORY {
        int id PK
        string name UK
        string slug UK
    }
    
    PRODUCT {
        int id PK
        string name
        string slug UK
        decimal price
        int stock
        int categoryId FK
    }
    
    ORDER {
        int id PK
        int userId FK
        decimal total
        enum status
        boolean isPaid
    }
```

---

## 📦 Módulos del Sistema

### 1️⃣ Módulo de Usuarios y Autenticación

**Ubicación**: `services/user.service.ts`, `services/auth.service.ts`, `controllers/user.controller.ts`

#### Funcionalidades

**Autenticación**:
- ✅ Registro de usuarios con validación de email único
- ✅ Login con generación de JWT
- ✅ Hash de contraseñas con bcrypt (10 salt rounds)
- ✅ Tokens JWT con expiración configurable

**Gestión de Usuarios**:
- ✅ Obtener perfil del usuario actual
- ✅ Actualizar información de perfil
- ✅ Listar todos los usuarios (solo ADMIN)
- ✅ Eliminar usuarios (solo ADMIN)

#### Seguridad

```typescript
// Las contraseñas NUNCA se devuelven en las respuestas
const user = await prisma.user.findUnique({
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    // password NO incluido
  }
});
```

---

### 2️⃣ Módulo de Categorías

**Ubicación**: `services/category.service.ts`, `controllers/category.controller.ts`

#### Funcionalidades

- ✅ CRUD completo de categorías
- ✅ Generación automática de slugs SEO-friendly
- ✅ Conteo de productos por categoría
- ✅ Prevención de eliminación si hay productos asociados

#### Ejemplo de Slug

```
Input:  "Remeras Deportivas"
Output: "remeras-deportivas"
```

---

### 3️⃣ Módulo de Productos

**Ubicación**: `services/product.service.ts`, `controllers/product.controller.ts`

#### Funcionalidades Principales

**CRUD de Productos**:
- ✅ Crear productos con validación de categoría
- ✅ Actualizar productos (solo ADMIN)
- ✅ Eliminar productos con cascade delete de imágenes
- ✅ Generación automática de slugs

**Gestión de Imágenes**:
- ✅ Agregar múltiples imágenes a un producto
- ✅ Eliminar imágenes individuales
- ✅ Cascade delete al eliminar producto

**Filtrado Avanzado**:

El sistema soporta filtros combinables mediante query parameters:

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `categoryId` | number | Filtrar por categoría | `?categoryId=1` |
| `minPrice` | number | Precio mínimo | `?minPrice=100` |
| `maxPrice` | number | Precio máximo | `?maxPrice=500` |
| `size` | enum | Talla disponible | `?size=M` |
| `isNew` | boolean | Solo productos nuevos | `?isNew=true` |
| `search` | string | Búsqueda en nombre/descripción | `?search=remera` |

**Ejemplo de uso**:
```
GET /api/products?categoryId=1&minPrice=200&maxPrice=800&size=M&isNew=true
```

---

### 4️⃣ Módulo de Órdenes

**Ubicación**: `services/order.service.ts`, `controllers/order.controller.ts`

#### Funcionalidades Principales

**Creación de Órdenes**:
- ✅ Validación de stock antes de crear orden
- ✅ Snapshot de precios al momento de compra
- ✅ Decremento automático de stock
- ✅ Cálculo automático de totales
- ✅ Transacciones atómicas con `$transaction`

**Gestión de Órdenes**:
- ✅ Listar órdenes del usuario
- ✅ Ver detalles de orden con items
- ✅ Cancelar órdenes (con restauración de stock)
- ✅ Actualizar estado de orden (solo ADMIN)
- ✅ Marcar como pagada (solo ADMIN)

#### Ciclo de Vida de una Orden

```mermaid
stateDiagram-v2
    [*] --> PENDING: Crear orden
    PENDING --> PAID: Pagar
    PENDING --> CANCELLED: Cancelar
    PAID --> SHIPPED: Enviar
    PAID --> CANCELLED: Cancelar
    SHIPPED --> DELIVERED: Entregar
    DELIVERED --> [*]
    CANCELLED --> [*]
    
    note right of DELIVERED
        No se puede cancelar
        una orden entregada
    end note
```

#### Validaciones de Negocio

```typescript
// ❌ No se puede cancelar orden entregada
if (order.status === 'DELIVERED') {
  throw new AppError('No se puede cancelar una orden entregada', 400);
}

// ✅ Restaurar stock al cancelar
await tx.product.update({
  where: { id: item.productId },
  data: { stock: { increment: item.quantity } }
});
```

---

## 🔌 API Endpoints

### Autenticación y Usuarios

```http
# Autenticación
POST   /api/auth/register       # Registrar nuevo usuario
POST   /api/auth/login          # Login (retorna JWT)

# Perfil
GET    /api/users/profile       # Obtener mi perfil (🔒 protegido)
PUT    /api/users/profile       # Actualizar mi perfil (🔒 protegido)

# Administración
GET    /api/users               # Listar usuarios (🔐 ADMIN)
GET    /api/users/:id           # Usuario por ID (🔐 ADMIN)
DELETE /api/users/:id           # Eliminar usuario (🔐 ADMIN)
```

### Categorías

```http
# Público
GET    /api/categories          # Listar todas
GET    /api/categories/:id      # Por ID
GET    /api/categories/slug/:slug # Por slug

# ADMIN
POST   /api/categories          # Crear (🔐 ADMIN)
PUT    /api/categories/:id      # Actualizar (🔐 ADMIN)
DELETE /api/categories/:id      # Eliminar (🔐 ADMIN)
```

### Productos

```http
# Público
GET    /api/products                     # Listar con filtros
GET    /api/products/:id                 # Por ID
GET    /api/products/slug/:slug          # Por slug
GET    /api/products/category/:categoryId # Por categoría

# ADMIN
POST   /api/products                     # Crear (🔐 ADMIN)
PUT    /api/products/:id                 # Actualizar (🔐 ADMIN)
DELETE /api/products/:id                 # Eliminar (🔐 ADMIN)
POST   /api/products/:id/images          # Agregar imágenes (🔐 ADMIN)
DELETE /api/products/images/:imageId     # Eliminar imagen (🔐 ADMIN)
```

### Órdenes

```http
# Usuario
POST   /api/orders              # Crear orden (🔒 autenticado)
GET    /api/orders              # Mis órdenes (🔒 autenticado)
GET    /api/orders/:id          # Detalles de orden (🔒 autenticado)
POST   /api/orders/:id/cancel   # Cancelar orden (🔒 autenticado)

# ADMIN
GET    /api/orders/all/admin    # Todas las órdenes (🔐 ADMIN)
PUT    /api/orders/:id/status   # Actualizar estado (🔐 ADMIN)
POST   /api/orders/:id/pay      # Marcar como pagada (🔐 ADMIN)
```

### Leyenda

- 🔓 Público (sin autenticación)
- 🔒 Protegido (requiere JWT)
- 🔐 Admin (requiere JWT + rol ADMIN)

---

## ⚙️ Configuración

### Variables de Entorno

El archivo `.env` contiene la configuración del sistema:

```bash
# Servidor
PORT=5001
NODE_ENV=development

# Base de Datos
DATABASE_URL="postgresql://ecommerce_user:ecommerce_password@localhost:5432/ecommerce_db?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

> [!IMPORTANT]
> En producción, **DEBES** cambiar `JWT_SECRET` por una clave segura aleatoria.

> [!WARNING]
> Nunca subas el archivo `.env` al control de versiones. Usa `.env.example` como plantilla.

---

## 🚀 Instalación y Uso

### Pre-requisitos

- **Node.js** v18+ 
- **Docker** y **Docker Compose**
- **npm** o **yarn**

### Paso 1: Clonar e Instalar Dependencias

```bash
# Clonar el repositorio
git clone <repository-url>
cd PROYECTO-E-COMMERCE

# Instalar dependencias
cd apps/server
npm install
```

### Paso 2: Configurar Variables de Entorno

```bash
# Copiar plantilla (si no existe .env)
cp .env.example .env

# Editar .env con tus valores
# El .env ya está configurado por defecto
```

### Paso 3: Iniciar Docker

```bash
# Desde la raíz del proyecto
docker compose up -d

# Verificar servicios
docker compose ps
```

Esto iniciará:
- **PostgreSQL** en `localhost:5432`
- **pgAdmin4** en `http://localhost:5050`

### Paso 4: Ejecutar Migraciones

```bash
# Desde apps/server
cd apps/server

# Crear esquema en la base de datos
npx prisma migrate dev --name init

# Generar cliente Prisma
npx prisma generate
```

### Paso 5: Iniciar Servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5001`

### Paso 6: Probar la API

```bash
# Health check
curl http://localhost:5001/health

# Registrar usuario
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login (guarda el token JWT)
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 🔒 Seguridad

### Autenticación JWT

El sistema utiliza **JSON Web Tokens** para autenticación:

1. El usuario hace login con email y password
2. El servidor valida credenciales y genera un JWT
3. El cliente incluye el JWT en el header `Authorization: Bearer <token>`
4. El middleware `auth.middleware.ts` valida el token en cada request

```typescript
// Ejemplo de header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Hash de Contraseñas

Las contraseñas se hashean con **bcrypt** antes de almacenarse:

```typescript
const hashedPassword = await bcrypt.hash(password, 10);
// 10 = número de salt rounds
```

> [!CAUTION]
> Las contraseñas **NUNCA** se devuelven en las respuestas de la API.

### Autorización por Roles

El middleware `role.middleware.ts` protege rutas según el rol:

```typescript
// Solo ADMIN puede acceder
router.post('/products', authenticate, requireRole('ADMIN'), createProduct);
```

---

## 🐳 Docker

### Servicios

El archivo `docker-compose.yml` define dos servicios:

#### PostgreSQL

```yaml
postgres:
  image: postgres:15
  ports: "5432:5432"
  environment:
    POSTGRES_USER: ecommerce_user
    POSTGRES_PASSWORD: ecommerce_password
    POSTGRES_DB: ecommerce_db
```

#### pgAdmin4

```yaml
pgadmin:
  image: dpage/pgadmin4
  ports: "5050:80"
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@ecommerce.com
    PGADMIN_DEFAULT_PASSWORD: admin123
```

### Comandos Útiles

```bash
# Iniciar servicios
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f

# Detener servicios
docker compose down

# Detener y eliminar volúmenes (⚠️ elimina datos)
docker compose down -v

# Reiniciar un servicio específico
docker compose restart postgres
```

### Conectar a pgAdmin4

1. Abrir [http://localhost:5050](http://localhost:5050)
2. Login con:
   - Email: `admin@ecommerce.com`
   - Password: `admin123`
3. Registrar servidor PostgreSQL:
   - **Host**: `postgres` (nombre del servicio Docker)
   - **Port**: `5432`
   - **Database**: `ecommerce_db`
   - **Username**: `ecommerce_user`
   - **Password**: `ecommerce_password`

---

## 🔧 Infraestructura Core

### Prisma Client

**Ubicación**: `config/prisma.ts`

Cliente singleton con:
- Pool de conexiones configurado
- Logging según entorno
- Manejo de desconexión graceful

```typescript
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error']
});
```

### Error Handler

**Ubicación**: `middleware/error-handler.ts`

Middleware global que maneja:
- Errores personalizados (`AppError`)
- Errores de Prisma (P2002, P2025, etc.)
- Respuestas consistentes
- Stack traces en desarrollo

```typescript
// Ejemplo de uso
throw new AppError('Producto no encontrado', 404);
```

### Utilidades de Request

**Ubicación**: `utils/request.ts`

Funciones seguras para extracción de parámetros:

```typescript
const id = getParam(req, 'id');        // Route params
const search = getQuery(req, 'search'); // Query params
```

---

## 📊 Estado del Proyecto

### ✅ Completado

- [x] Arquitectura completa de backend REST
- [x] Autenticación JWT con hash bcrypt
- [x] Autorización basada en roles (CLIENT/ADMIN)
- [x] CRUD completo para todos los recursos
- [x] Filtrado avanzado de productos
- [x] Gestión de órdenes con transacciones seguras
- [x] Control de stock automático
- [x] Manejo de errores robusto
- [x] Validación de requests con express-validator
- [x] Docker con PostgreSQL y pgAdmin4
- [x] TypeScript sin errores de compilación

---

## 🚧 Próximos Pasos

Funcionalidades potenciales para futuras iteraciones:

- [ ] **Script de seed data**: Datos de prueba automatizados
- [ ] **Refresh Tokens**: Implementar refresh tokens para mayor seguridad
- [ ] **Upload de Imágenes**: Integración con S3/Cloudinary
- [ ] **Paginación**: Paginación en listados de productos/órdenes
- [ ] **Rate Limiting**: Protección contra abuso de API
- [ ] **Tests de Integración**: Cobertura de testing
- [ ] **Documentación Swagger**: OpenAPI/Swagger UI
- [ ] **Búsqueda Full-text**: Búsqueda avanzada con PostgreSQL
- [ ] **Cache con Redis**: Optimización de rendimiento
- [ ] **Webhooks**: Integración con pasarelas de pago

---

## 📚 Recursos Adicionales

- [`DOC.md`](DOC.md) - Documentación técnica detallada del desarrollo
- [`.env.example`](.env.example) - Plantilla de variables de entorno
- [`prisma/schema.prisma`](apps/server/prisma/schema.prisma) - Esquema de base de datos

---

## 🤝 Contribuciones

Para contribuir al proyecto:

1. Crear una rama desde `main`
2. Hacer cambios y commits descriptivos
3. Asegurar que TypeScript compila sin errores
4. Crear Pull Request con descripción detallada

---

## 📝 Licencia

Este proyecto es de uso interno. Todos los derechos reservados.

---

**🚀 El backend está completamente funcional y listo para conectarse al frontend!**
