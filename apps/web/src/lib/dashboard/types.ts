import { DateRange } from 'react-day-picker';

export type DashboardQuickRange = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | 'ALL';

export interface DashboardAnalytics {
    totalSales: number;
    pendingOrders: number;
    aov: number;
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
