import { Coupon, Order } from '@/types';

export type CouponStatus = 'ACTIVO' | 'EXPIRADO' | 'INACTIVO';

export interface CouponStats {
  revenue: number;
  totalDiscount: number;
  roi: number | null;
  count: number;
}

export function getCouponStatus(coupon: Coupon): CouponStatus {
  if (!coupon.isActive) return 'INACTIVO';
  if (coupon.endDate && new Date(coupon.endDate) < new Date()) return 'EXPIRADO';
  return 'ACTIVO';
}

export function getCouponStats(couponId: string, orders: Order[]): CouponStats {
  const couponOrders = orders.filter(o => o.couponId === couponId);
  const revenue = couponOrders.reduce((sum, o) => sum + o.total, 0);
  const totalDiscount = couponOrders.reduce((sum, o) => sum + (o.discountAmount ?? 0), 0);
  const roi = totalDiscount > 0 ? (revenue - totalDiscount) / totalDiscount : null;
  return { revenue, totalDiscount, roi, count: couponOrders.length };
}
