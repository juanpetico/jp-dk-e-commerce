import { Address, Order } from '@/types';
import { UserCouponRecord } from '@/services/couponService';

export interface CustomerDrawerProps {
    userId: string | null;
    open: boolean;
    onClose: () => void;
}

export type DrawerTab = 'ORDERS' | 'COUPONS' | 'ADDRESSES';

export interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export interface OrdersSectionProps {
    orders: Order[];
    onSelectOrder: (order: Order) => void;
}

export interface CouponsSectionProps {
    activeCoupons: UserCouponRecord[];
    usedCoupons: UserCouponRecord[];
}

export interface AddressesSectionProps {
    addresses: Address[];
}
