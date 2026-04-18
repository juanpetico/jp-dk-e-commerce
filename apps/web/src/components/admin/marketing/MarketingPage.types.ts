import { Coupon } from '@/types';
import { CouponStats, CouponStatus } from '@/lib/coupon-utils';

export type MarketingStatusFilter = 'ALL' | 'ACTIVO' | 'EXPIRADO' | 'INACTIVO';
export type MarketingTypeFilter = 'ALL' | 'PERCENTAGE' | 'FIXED_AMOUNT';
export type MarketingSortKey = 'code' | 'usedCount' | 'roi' | 'revenue' | 'createdAt';
export type MarketingSortDir = 'asc' | 'desc';

export interface EnrichedCoupon extends Coupon {
    _status: CouponStatus;
    _stats: CouponStats;
}
