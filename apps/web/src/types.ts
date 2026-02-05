export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: string;
    sizes: string[];
    isNew?: boolean;
    isSale?: boolean;
    description?: string;
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
    city: string;
    region: string;
    zipCode?: string; // Código postal
    country: string;
    phone: string;
    isDefault: boolean;
}

export interface Order {
    id: string;
    date: string; // Mantener para compatibilidad con código existente (formato legible)
    status: 'Confirmado' | 'Enviado' | 'Entregado';
    total: number;
    subtotal: number; // Subtotal antes de impuestos y envío
    shippingCost: number; // Costo de envío
    taxes: number; // Impuestos aplicados
    taxRate: number; // Tasa de impuesto (ej: 0.19 para 19%)
    shippingMethod?: string; // Descripción del método de envío
    shippingAddress: Address;
    billingAddress: Address;
    items: CartItem[];
    createdAt?: Date; // Fecha de creación
    confirmedAt?: Date; // Fecha de confirmación
    updatedAt?: Date; // Última actualización
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
