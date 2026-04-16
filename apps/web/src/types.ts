export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    _count?: { products: number };
}

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Coupon {
    id: string;
    code: string;
    description?: string;
    type: DiscountType;
    value: number;
    minAmount: number;
    maxUses?: number | null;
    usedCount: number;
    maxUsesPerUser: number;
    startDate: string | Date;
    endDate?: string | Date | null;
    isActive: boolean;
}

export interface ProductImage {
    id: string;
    url: string;
    productId: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discountPercent?: number;
    images: ProductImage[];
    category: Category;
    categoryId?: string; // Optional for now to avoid breaking other components
    isNew?: boolean;
    isSale?: boolean;
    description?: string;
    variants: ProductVariant[];
    slug: string;
    isPublished: boolean;
}

export interface ProductVariant {
    id: string;
    size: string;
    stock: number;
    productId: string;
}

export interface CartItem extends Product {
    cartItemId?: string; // ID from backend
    selectedSize: string;
    quantity: number;
}

export interface Address {
    id: string;
    name: string;
    rut?: string;
    street: string;
    comuna: string;
    region: string;
    zipCode?: string; // Código postal
    city?: string;
    country: string;
    phone: string;
    company?: string;
    isDefault: boolean;
}

// OrderStatus del backend: PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    size: string;
    product: Product;
}

export interface Order {
    id: string;
    date: string; // Fecha formato string para frontend
    status: OrderStatus;
    total: number;
    subtotal: number; // Subtotal antes de impuestos y envío
    shippingCost: number; // Costo de envío
    taxes: number; // Impuestos aplicados
    taxRate: number; // Tasa de impuesto (ej: 0.19 para 19%)
    shippingMethod?: string; // Descripción del método de envío
    isPaid: boolean;
    paidAt?: string | null; // DateTime del backend
    confirmedAt?: string | null; // Fecha de confirmación
    shippingAddress: Address;
    billingAddress: Address;
    items: OrderItem[];
    userId: string;
    user?: {
        id: string;
        name: string | null;
        email: string;
        phone?: string | null;
    };
    createdAt: string; // DateTime del backend
    updatedAt: string; // Última actualización
    earnedCoupon?: { code: string; message: string } | null;

    // Snapshot fields
    customerName?: string | null;
    customerEmail?: string | null;
    customerPhone?: string | null;

    shippingName?: string | null;
    shippingRut?: string | null;
    shippingStreet?: string | null;
    shippingComuna?: string | null;
    shippingRegion?: string | null;
    shippingZipCode?: string | null;
    shippingPhone?: string | null;

    billingName?: string | null;
    billingRut?: string | null;
    billingStreet?: string | null;
    billingComuna?: string | null;
    billingRegion?: string | null;
    billingZipCode?: string | null;
    billingPhone?: string | null;
    billingCompany?: string | null;

    // Coupon fields
    couponId?: string | null;
    coupon?: Coupon | null;
    discountAmount: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    isActive?: boolean;
    deactivationReason?: string | null;
    lastLogin?: string | null;
    addresses: Address[];
    orders: Order[];
    totalSpent?: number;
    ordersCount?: number;
    lastOrder?: string;
    status?: string;
}

export type UserRole = 'CLIENT' | 'ADMIN' | 'SUPERADMIN';

export interface AdminUser {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    isActive: boolean;
    deactivationReason?: string | null;
    lastLogin: string | null;
    createdAt: string;
}

export type AuditAction =
    | 'ROLE_CHANGE'
    | 'STATUS_CHANGE'
    | 'PRODUCT_CREATED'
    | 'PRODUCT_DELETED'
    | 'PRODUCT_PRICE_CHANGE'
    | 'PRODUCT_STOCK_CHANGE'
    | 'PRODUCT_PUBLISHED'
    | 'PRODUCT_UNPUBLISHED'
    | 'ORDER_STATUS_CHANGE'
    | 'CATEGORY_CREATED'
    | 'CATEGORY_DELETED'
    | 'STORE_CONFIG_CHANGE';

export interface AuditEntry {
    id: string;
    action: AuditAction | string;
    entityType: string;
    entityId: string;
    oldValue: string | null;
    newValue: string | null;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
    actor: {
        id: string;
        name: string | null;
        email: string;
    };
}

export interface AuditLogsResult {
    items: AuditEntry[];
    total: number;
}

export interface CartState {
    items: CartItem[];
    isOpen: boolean;
    total: number;
}
