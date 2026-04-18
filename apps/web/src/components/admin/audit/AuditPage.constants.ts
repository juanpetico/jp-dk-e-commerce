export const ITEMS_PER_PAGE_DEFAULT = 20;

export const ENTITY_TYPE_OPTIONS = [
    { value: 'ALL', label: 'Todas las entidades' },
    { value: 'USER', label: 'Usuarios' },
    { value: 'PRODUCT', label: 'Productos' },
    { value: 'ORDER', label: 'Ordenes' },
    { value: 'CATEGORY', label: 'Categorias' },
    { value: 'COUPON', label: 'Cupones' },
    { value: 'STORE_CONFIG', label: 'Configuracion' },
];

export const ACTION_CONFIG: Record<string, { label: string; className: string }> = {
    ROLE_CHANGE: { label: 'Estado de Usuario', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    STATUS_CHANGE: { label: 'Estado de Usuario', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    PRODUCT_CREATED: { label: 'Estado de Producto', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    PRODUCT_DELETED: { label: 'Estado de Producto', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    PRODUCT_PRICE_CHANGE: { label: 'Estado de Producto', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    PRODUCT_STOCK_CHANGE: { label: 'Estado de Producto', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    PRODUCT_PUBLISHED: { label: 'Estado de Producto', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    PRODUCT_UNPUBLISHED: { label: 'Estado de Producto', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    ORDER_STATUS_CHANGE: { label: 'Estado de Orden', className: 'bg-indigo-200 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
    CATEGORY_CREATED: { label: 'Estado de Categoria', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
    CATEGORY_PUBLISHED: { label: 'Estado de Categoria', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
    CATEGORY_UNPUBLISHED: { label: 'Estado de Categoria', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
    CATEGORY_DELETED: { label: 'Estado de Categoria', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
    STORE_CONFIG_CHANGE: { label: 'Estado de Configuracion', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
    COUPON_CREATED: { label: 'Estado de Cupon', className: 'bg-violet-200 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' },
    COUPON_UPDATED: { label: 'Estado de Cupon', className: 'bg-violet-200 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' },
    COUPON_DELETED: { label: 'Estado de Cupon', className: 'bg-violet-200 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' },
    PRODUCT_SALE_CHANGE: { label: 'Estado de Producto', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
};

export const ROLE_LABELS: Record<string, string> = {
    CLIENT: 'Cliente',
    ADMIN: 'Admin',
    SUPERADMIN: 'Superadmin',
};

export const SALE_FIELD_LABELS: Record<string, string> = {
    isSale: 'En oferta',
    originalPrice: 'Precio original',
    discountPercent: 'Descuento %',
};

export const COUPON_FIELD_LABELS: Record<string, string> = {
    code: 'Codigo',
    value: 'Valor',
    type: 'Tipo',
    isActive: 'Activo',
    description: 'Descripcion',
    minAmount: 'Monto minimo',
    maxUses: 'Usos maximos',
    isPublic: 'Publico',
};

export const CONFIG_FIELD_LABELS: Record<string, string> = {
    freeShippingThreshold: 'Envio gratis desde',
    baseShippingCost: 'Costo de envio',
    defaultTaxRate: 'IVA',
    lowStockThreshold: 'Stock minimo',
    vipThreshold: 'Umbral VIP',
    vipCouponCode: 'Codigo VIP',
    vipCouponType: 'Tipo VIP',
    vipCouponValue: 'Valor VIP',
    vipRewardMessage: 'Mensaje VIP',
    welcomeCouponCode: 'Codigo Bienvenida',
    welcomeCouponType: 'Tipo Bienvenida',
    welcomeCouponValue: 'Valor Bienvenida',
};
