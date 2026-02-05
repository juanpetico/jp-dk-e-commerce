# Docker Compose - PostgreSQL + pgAdmin4

Este archivo configura un entorno completo de base de datos para el proyecto e-commerce.

## Servicios Incluidos

### 1. PostgreSQL (Puerto 5432)
- **Imagen**: `postgres:16-alpine`
- **Usuario**: `ecommerce_user`
- **Contraseña**: `ecommerce_password`
- **Base de datos**: `ecommerce_db`
- **Volume**: `postgres_data` (persiste los datos)

### 2. pgAdmin4 (Puerto 5050)
- **Imagen**: `dpage/pgadmin4:latest`
- **Email**: `admin@ecommerce.com`
- **Contraseña**: `admin123`
- **Volume**: `pgadmin_data` (persiste configuración)

## Comandos

### Iniciar servicios
```bash
docker-compose up -d
```

### Ver logs
```bash
docker-compose logs -f
```

### Detener servicios
```bash
docker-compose down
```

### Detener y eliminar volumes 
```bash
docker-compose down -v
```

## Acceso a pgAdmin4

1. Abrir navegador en: `http://localhost:5050`
2. Login:
   - **Email**: `admin@ecommerce.com`
   - **Contraseña**: `admin123`

3. Agregar servidor PostgreSQL:
   - Click derecho en "Servers" → "Register" → "Server"
   - **General Tab**:
     - Name: `E-commerce DB`
   - **Connection Tab**:
     - Host name/address: `postgres`
     - Port: `5432`
     - Maintenance database: `ecommerce_db`
     - Username: `ecommerce_user`
     - Password: `ecommerce_password`
     - Save password: ✓

## Conexión desde la aplicación

El `DATABASE_URL` en `.env` debe ser:

```env
# Cuando la app corre FUERA de Docker (desarrollo local)
DATABASE_URL="postgresql://ecommerce_user:ecommerce_password@localhost:5432/ecommerce_db?schema=public"

# Cuando la app corre DENTRO de Docker
DATABASE_URL="postgresql://ecommerce_user:ecommerce_password@postgres:5432/ecommerce_db?schema=public"
```

## Ejecutar migraciones

Con Docker corriendo:

```bash
cd apps/server
pnpm --filter server exec prisma migrate dev --name init
pnpm --filter server exec prisma generate
```

## Health Check

PostgreSQL tiene un health check configurado que verifica la disponibilidad antes de que dependan otros servicios.

## Volumes

Los datos se persisten en volumes de Docker:
- `postgres_data`: Datos de la base de datos
- `pgadmin_data`: Configuración de pgAdmin4

Estos volumes sobreviven a reinicios de contenedores.
