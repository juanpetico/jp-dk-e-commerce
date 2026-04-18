import { CartItem, OrderStatus } from '@/types';

export interface ShippingConfig {
    baseShippingCost: number;
    freeShippingThreshold: number;
}

export interface CheckoutOrderSnapshot {
    orderId: string | null;
    orderedItems: CartItem[];
    snapshotTotal: number;
    snapshotDiscount: number;
    snapshotStatus: OrderStatus | null;
}

export interface CheckoutSuccessCoupon {
    code: string;
    message: string;
}

export interface CheckoutContactCardProps {
    email?: string;
    formattedAddress: string;
    shippingCostLabel: string;
}
