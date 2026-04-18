import { Order } from '@/types';
import { SnapshotAddress } from './OrderDetailsPage.types';

export const formatOrderPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
};

export const getOrderShippingSnapshot = (order: Order): SnapshotAddress => {
    return {
        name: order.shippingName || order.shippingAddress?.name || 'N/A',
        rut: order.shippingRut || order.shippingAddress?.rut || 'N/A',
        street: order.shippingStreet || order.shippingAddress?.street,
        comuna: order.shippingComuna || order.shippingAddress?.comuna,
        region: order.shippingRegion || order.shippingAddress?.region,
        zipCode: order.shippingZipCode || order.shippingAddress?.zipCode,
        phone: order.shippingPhone || order.shippingAddress?.phone || 'N/A',
        country: 'Chile',
    };
};

export const getOrderBillingSnapshot = (order: Order): SnapshotAddress => {
    return {
        name: order.billingName || order.billingAddress?.name || 'N/A',
        rut: order.billingRut || order.billingAddress?.rut || 'N/A',
        company: order.billingCompany,
        street: order.billingStreet || order.billingAddress?.street,
        comuna: order.billingComuna || order.billingAddress?.comuna,
        region: order.billingRegion || order.billingAddress?.region,
        zipCode: order.billingZipCode || order.billingAddress?.zipCode,
        phone: order.billingPhone || order.billingAddress?.phone,
        country: 'Chile',
    };
};

export const getOrderSavingsForItem = (orderItem: Order['items'][number]) => {
    return ((orderItem.product.originalPrice || orderItem.product.price) - orderItem.price) * orderItem.quantity;
};
