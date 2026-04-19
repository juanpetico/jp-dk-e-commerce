# Design System

## Resumen

Este documento define el sistema visual del proyecto: tokens de color, patrones de componentes recurrentes (tablas, badges, chips, estados) e íconos. El objetivo es que cualquier componente nuevo sea visualmente consistente sin tener que inspeccionar componentes existentes.

---

## 1. Tokens de color

Los colores se usan **siempre a través de variables CSS semánticas**, nunca valores hardcoded. El tema dark se activa con la clase `.dark`.

### Tokens principales

| Token | Uso |
|---|---|
| `background` / `foreground` | Fondo y texto principal de la app |
| `primary` / `primary-foreground` | Acciones principales, botones CTA |
| `muted` / `muted-foreground` | Texto secundario, placeholders, etiquetas |
| `border` | Bordes en modo dark |
| `destructive` / `destructive-foreground` | Errores, eliminar, alertas rojas |
| `card` / `card-foreground` | Contenedores elevados |

### Bordes en contenedores e inputs

Patrón estándar para inputs, tablas y contenedores del admin:

```tsx
className="border border-gray-300 dark:border-border"
```

Nunca usar `border-gray-200` ni `border-zinc-300` sueltos; siempre mantener el par `light/dark`.

### Color rojo de la app

El rojo se toma de los tokens de la pantalla de inicio de sesión. Usar `destructive` para estados de error y acciones de eliminar. No crear variantes personalizadas de rojo.

---

## 2. Tipografía

- Fuente: **Montserrat** (Google Fonts), cargada en el layout raíz.
- Escalas: usar las clases de Tailwind (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`). No agregar tamaños custom.
- Peso: `font-medium` para labels de formulario, `font-semibold` para títulos de sección, `font-bold` para títulos de página.

---

## 3. Tablas

Todas las tablas del admin siguen el mismo patrón de controles:

| Elemento | Convención |
|---|---|
| Barra superior | Búsqueda a la izquierda + botones de acción a la derecha |
| Paginación | Inferior derecha, componente `DataTablePagination` compartido |
| Columnas de acciones | Última columna, íconos de editar y eliminar |
| Estado vacío | Mensaje centrado con ícono ilustrativo |
| Ordenamiento | `ArrowUpDown` en el header de columnas ordenables |

Cualquier tabla nueva debe reutilizar el layout y los controles existentes antes de crear variantes.

---

## 4. Badges y selectores coloridos

Los badges de estado (ej. `PENDING`, `DELIVERED`, `ACTIVE`) usan tonos con buen contraste tanto en light como en dark. El patrón es `bg-{color}/10 text-{color}-700 dark:text-{color}-400`.

Ejemplos de paleta de estados:

| Estado | Clase sugerida |
|---|---|
| Activo / Completado | `bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400` |
| Pendiente / En proceso | `bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400` |
| Cancelado / Error | `bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400` |
| Inactivo / Archivado | `bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400` |

No inventar colores nuevos para estados nuevos; reutilizar esta paleta.

---

## 5. Chips de período (1D · 7D · 1M · etc.)

Los selectores de período tienen dos variantes válidas; ambas coexisten en la app:

| Variante | Cuándo usarla |
|---|---|
| **Con fondo** (`bg-primary text-primary-foreground`) | Elemento activo dentro del grupo |
| **Solo texto bold** (`font-semibold text-foreground`) | Elemento activo en contextos más compactos (ej. dashboard) |

Regla: dentro de un mismo componente, usar una sola variante. No mezclar ambas en el mismo grupo de chips.

---

## 6. Estados de carga y error

Todos los estados de carga y error deben ser **idénticos entre páginas**. No crear skeletons ad-hoc por página.

| Estado | Componente a usar |
|---|---|
| Carga inicial de página | `[PageName].skeleton.tsx` con el mismo layout que la página |
| Error de fetch | Componente `ErrorState` compartido (mensaje + botón de reintentar) |
| Lista vacía | Componente `EmptyState` compartido (ícono + mensaje descriptivo) |
| Submitting de formulario | Botón con `disabled` + spinner inline |

---

## 7. Íconos

Todos los íconos provienen de **Lucide React**. No mezclar con otras librerías.

### Íconos canónicos por acción

| Acción | Ícono |
|---|---|
| Editar | `Pencil` |
| Eliminar | `Trash2` |
| Ver detalle | `Eye` |
| Agregar / Crear | `Plus` |
| Cerrar / Descartar | `X` |
| Confirmar / Guardar | `Check` |
| Exportar | `Download` |
| Buscar | `Search` |
| Filtrar | `SlidersHorizontal` |
| Menú / Más opciones | `MoreHorizontal` |
| Alerta / Advertencia | `AlertTriangle` |

No usar `Edit`, `Edit2` ni `Trash` (sin número); siempre `Pencil` y `Trash2`.

---

## 8. Border radius

| Clase | Valor | Uso |
|---|---|---|
| `rounded-sm` | 0.25rem | Badges, chips pequeños |
| `rounded-md` | 0.375rem | Inputs, selects |
| `rounded-lg` | 0.5rem | Cards, modales, botones principales |

---

## 9. Ideas a considerar (backlog de mejoras)

- **Storybook / catálogo local**: documentar los componentes compartidos con ejemplos visuales.
- **Tokens de z-index**: definir capas explícitas para modales, toasts y dropdowns para evitar conflictos.
- **Patrón de toasts**: definir si se usa `sonner` o el toast de shadcn, con mensajes de éxito/error estandarizados.
- **Animaciones**: definir si se usa `transition-all duration-200` globalmente o por componente.
- **Accesibilidad mínima**: todos los íconos de acción deben tener `aria-label`; revisar contraste AA en los badges.
- **Responsive breakpoints**: definir cuándo las tablas del admin colapsan a vista de cards en mobile.
