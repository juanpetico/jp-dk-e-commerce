import { Order, OrderStatus } from '@/types';

export interface OrderAddressSnapshot {
    name: string;
    rut: string;
    street?: string;
    comuna?: string;
    region?: string;
    zipCode?: string;
    phone?: string;
    method?: string;
    company?: string | null;
}

export interface OrderCustomerSnapshot {
    name: string;
    email: string;
    phone: string;
}

export const buildOrderSnapshotData = (order: Order) => {
    const shipping: OrderAddressSnapshot = {
        name: order.shippingName || order.shippingAddress?.name || 'N/A',
        rut: order.shippingRut || order.shippingAddress?.rut || 'N/A',
        street: order.shippingStreet || order.shippingAddress?.street,
        comuna: order.shippingComuna || order.shippingAddress?.comuna,
        region: order.shippingRegion || order.shippingAddress?.region,
        zipCode: order.shippingZipCode || order.shippingAddress?.zipCode,
        phone: order.shippingPhone || order.shippingAddress?.phone || 'N/A',
        method: order.shippingMethod || 'Estándar',
    };

    const billing: OrderAddressSnapshot = {
        name: order.billingName || order.billingAddress?.name || 'N/A',
        rut: order.billingRut || order.billingAddress?.rut || 'N/A',
        street: order.billingStreet || order.billingAddress?.street,
        comuna: order.billingComuna || order.billingAddress?.comuna,
        region: order.billingRegion || order.billingAddress?.region,
        zipCode: order.billingZipCode || order.billingAddress?.zipCode,
        phone: order.billingPhone || order.billingAddress?.phone,
        company: order.billingCompany,
    };

    const customer: OrderCustomerSnapshot = {
        name: order.customerName || order.user?.name || 'Invitado',
        email: order.customerEmail || order.user?.email || 'N/A',
        phone: order.customerPhone || order.user?.phone || 'N/A',
    };

    return { shipping, billing, customer };
};

export const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
    }).format(price);
};

export const formatOrderDate = (createdAt: string) => {
    return new Date(createdAt).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'DELIVERED':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50';
        case 'CANCELLED':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50';
        case 'CONFIRMED':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50';
        default:
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50';
    }
};
