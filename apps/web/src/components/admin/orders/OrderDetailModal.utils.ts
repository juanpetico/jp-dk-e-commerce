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
            return 'bg-green-100 text-green-800 border-green-200';
        case 'SHIPPED':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'CANCELLED':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'CONFIRMED':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        default:
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
};
