import { DateRange } from 'react-day-picker';

export type DashboardQuickRange = '1D' | '7D' | '1M' | '6M' | 'YTD' | '1Y' | 'ALL';
export type DashboardAttributionQuickRange = Extract<DashboardQuickRange, '1D' | '7D' | '1M'>;

export interface MarketingAttributionMetrics {
    couponAttributedRevenue: number;
    couponAttributedRevenueRate: number;
    couponOrdersCount: number;
    couponOrdersRate: number;
    validOrdersCount: number;
}

export interface DashboardAnalytics {
    totalSales: number;
    pendingOrders: number;
    aov: number;
    couponAttributedRevenue: number;
    couponAttributedRevenueRate: number;
    couponOrdersCount: number;
    couponOrdersRate: number;
    validOrdersCount: number;
    abandonedCartRate: number;
    abandonedCartCount: number;
    abandonedCartEligibleCount: number;
    abandonedCartPotentialRevenue: number;
    abandonedCartInactiveHours: number;
    lowStockCount: number;
    lowStockThreshold: number;
}

export interface SalesTrendPoint {
    day: string;
    fullDate: string;
    ventas: number;
}

export interface CategorySalesPoint {
    name: string;
    value: number;
}

export type DashboardDateRange = DateRange;
