import { MyCoupon } from '@/services/couponService';

export interface CouponsPageHeaderProps {
    totalCoupons: number;
}

export interface CouponsPageEmptyProps {
    hasError: boolean;
}

export interface CouponsPageGridProps {
    coupons: MyCoupon[];
    copiedCode: string | null;
    onCopy: (code: string) => void;
}
