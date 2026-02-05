export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
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
    sizes: string[];
    isNew?: boolean;
    isSale?: boolean;
    description?: string;
    stock: number;
    slug: string;
    isPublished: boolean;
}

export interface CartItem extends Product {
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
    country: string;
    phone: string;
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
    };
    createdAt: string; // DateTime del backend
    updatedAt: string; // Última actualización
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    addresses: Address[];
    orders: Order[];
}

export interface CartState {
    items: CartItem[];
    isOpen: boolean;
    total: number;
}
