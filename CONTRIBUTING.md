# 🛠 Guía de Estándares de Git y Flujo de Trabajo

Este documento define las reglas de convivencia con el repositorio para asegurar que el historial sea legible, escalable y profesional. Seguir estas normas facilita la integración continua y evita conflictos en el código.

---

## 1. Naming Convention de Ramas 🌿

Para mantener el orden en el panel de ramas, utilizaremos prefijos que identifiquen el propósito de cada cambio. Las ramas deben crearse siempre a partir de `develop`.

| Prefijo | Propósito | Ejemplo |
| :--- | :--- | :--- |
| **`feat/`** | Nuevas funcionalidades | `feat/login-cookies` |
| **`fix/`** | Corrección de errores (bugs) | `fix/error-precio-carrito` |
| **`docs/`** | Cambios exclusivamente en documentación | `docs/actualiza-readme` |
| **`refactor/`** | Mejoras al código que no cambian la lógica | `refactor/limpieza-clases-css` |
| **`chore/`** | Tareas de mantenimiento o configuración | `chore/config-pnpm-turbo` |

---

## 2. Estándar de Mensajes de Commit 💬

Implementaremos **Conventional Commits**. El formato de cada mensaje debe ser:
`<tipo>: <descripción breve en minúsculas>`

### Ejemplos:
* `feat: implementa persistencia de carrito en localstorage`
* `fix: resuelve parpadeo en la imagen de la polera shooters`
* `docs: actualiza readme`
* `refactor: mejora la lógica de la página de inicio`   
* `chore: añade dependencia de lucide-react al paquete ui`

> **Nota:** Se recomienda que los mensajes sean en español para mantener la consistencia con el equipo, pero siempre manteniendo el `<tipo>` en inglés según el estándar.

---

## 3. Flujo de Trabajo (Paso a Paso) 🚀

Sigue esta receta cada vez que quieras programar algo nuevo:

### Paso 1: Sincronizar con Develop
Antes de empezar, asegúrate de tener lo último.
```bash
git switch develop
git pull origin develop
```

### Paso 2: Crear rama de trabajo
Nunca trabajes directamente sobre `develop` o `main`.
```bash
# Usa el prefijo correspondiente
git switch -c feat/nombre-de-la-tarea
```

### Paso 3: Desarrollo y Commits Atómicos
Haz commits pequeños y claros.
```bash
git add .
git commit -m "feat: descripción corta de lo que hiciste"
```

### Paso 4: Publicar cambios
Sube tu rama al repositorio remoto.
```bash
git push origin feat/nombre-de-la-tarea
```

### Paso 5: Integración en GitHub (Pull Request)
1. Entra al repositorio en GitHub.
2. Crea un Pull Request (PR) desde tu rama hacia `develop`.
3. Revisa los cambios visualmente en la pestaña "Files changed".
4. Realiza el Merge (preferiblemente "Squash and merge" para un historial limpio).
5. Borra la rama en GitHub después de la integración.

### Paso 6: Limpieza Local
Vuelve a tu base local y actualiza.
```bash
git switch develop
git pull origin develop
git branch -d feat/nombre-de-la-tarea
```

---

## 4. Arquitectura de Ramas 🏗️

* **`main`**: Solo código estable que está en producción (conectado a Vercel/Azure). Cada cambio aquí es una versión oficial.
* **`develop`**: El campo de pruebas principal. Aquí se integran todas las nuevas funcionalidades antes de pasar a producción.
* **`feature/*`**: Ramas temporales para desarrollo. Mueren una vez que se integran a `develop`.
