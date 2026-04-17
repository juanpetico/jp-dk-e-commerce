import { CartItem, Coupon } from '@/types';

export const SHIPPING_FALLBACK = { baseShippingCost: 3990, freeShippingThreshold: 50000 };

export const calculateCouponDiscount = (total: number, coupon: Coupon | null) => {
    if (!coupon) return 0;

    return coupon.type === 'PERCENTAGE'
        ? Math.round(total * (coupon.value / 100))
        : Math.min(coupon.value, total);
};

export const formatCheckoutAddress = (address?: {
    name: string;
    rut?: string;
    street: string;
    comuna: string;
    country: string;
    phone: string;
}) => {
    if (!address) {
        return 'No tienes direcciones guardadas. Por favor agrega una.';
    }

    return `${address.name}, ${address.rut || ''}, ${address.street}, ${address.comuna}, ${address.country}, ${address.phone}`;
};

export const mapOrderItemsPayload = (items: CartItem[]) => {
    return items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        size: item.selectedSize,
    }));
};
