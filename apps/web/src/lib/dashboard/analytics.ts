import { isSameDay, eachDayOfInterval, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Order, Product } from '@/types';
import { isProductLowStock, normalizeLowStockThreshold } from '@/lib/stock/stock-status';
import {
    CategorySalesPoint,
    DashboardAnalytics,
    MarketingAttributionMetrics,
    DashboardDateRange,
    SalesTrendPoint,
} from './types';

function readCategoryRuntimeValue(product: Product): unknown {
    return (product as unknown as { category?: unknown }).category;
}

function readCategoryNameFromRuntime(value: unknown): string | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const maybeName = (value as { name?: unknown }).name;
    return typeof maybeName === 'string' ? maybeName : null;
}

function readCategoryIdFromRuntime(value: unknown): string | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const maybeId = (value as { id?: unknown }).id;
    return typeof maybeId === 'string' ? maybeId : null;
}

export function calculateDashboardAnalytics(
    orders: Order[],
    products: Product[],
    dateRange: DashboardDateRange | undefined,
    abandonedCartFunnel: {
        abandonedRate: number;
        abandonedCarts: number;
        eligibleCarts: number;
        potentialRevenue: number;
        hoursInactiveThreshold: number;
    } | null,
    lowStockThreshold?: number
): DashboardAnalytics {
    const from = dateRange?.from ? startOfDay(dateRange.from) : null;
    const to = dateRange?.to ? endOfDay(dateRange.to) : from ? endOfDay(from) : null;

    const ordersInRange = from && to
        ? orders.filter((order) => isWithinInterval(new Date(order.createdAt), { start: from, end: to }))
        : orders;

    const validOrders = ordersInRange.filter((order) => order.status !== 'CANCELLED');
    const totalSales = validOrders.reduce((acc, order) => acc + order.total, 0);

    const pendingOrders = ordersInRange.filter((order) => order.status === 'PENDING').length;

    const validOrdersCount = validOrders.length;
    const aov = validOrdersCount > 0 ? totalSales / validOrdersCount : 0;

    const couponOrders = validOrders.filter((order) => !!order.couponId);
    const couponOrdersCount = couponOrders.length;
    const couponAttributedRevenue = couponOrders.reduce((acc, order) => acc + order.total, 0);
    const couponAttributedRevenueRate = totalSales > 0 ? (couponAttributedRevenue / totalSales) * 100 : 0;
    const couponOrdersRate = validOrdersCount > 0 ? (couponOrdersCount / validOrdersCount) * 100 : 0;

    const normalizedLowStockThreshold = normalizeLowStockThreshold(lowStockThreshold);
    const lowStockCount = products.filter((product) => isProductLowStock(product, normalizedLowStockThreshold)).length;

    return {
        totalSales,
        pendingOrders,
        aov,
        couponAttributedRevenue,
        couponAttributedRevenueRate,
        couponOrdersCount,
        couponOrdersRate,
        validOrdersCount,
        abandonedCartRate: abandonedCartFunnel?.abandonedRate ?? 0,
        abandonedCartCount: abandonedCartFunnel?.abandonedCarts ?? 0,
        abandonedCartEligibleCount: abandonedCartFunnel?.eligibleCarts ?? 0,
        abandonedCartPotentialRevenue: abandonedCartFunnel?.potentialRevenue ?? 0,
        abandonedCartInactiveHours: abandonedCartFunnel?.hoursInactiveThreshold ?? 24,
        lowStockCount,
        lowStockThreshold: normalizedLowStockThreshold,
    };
}

export function buildDashboardSalesTrendData(
    orders: Order[],
    dateRange: DashboardDateRange | undefined
): SalesTrendPoint[] {
    if (!dateRange?.from) return [];

    const start = startOfDay(dateRange.from);
    const end = endOfDay(dateRange.to || dateRange.from);
    const dateArray = eachDayOfInterval({ start, end });
    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

    return dateArray.map((date) => {
        const dayName = days[date.getDay()] ?? 'N/A';
        const dateStr = date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });

        const dailySales = orders
            .filter((order) => order.status !== 'CANCELLED' && isSameDay(new Date(order.createdAt), date))
            .reduce((acc, order) => acc + order.total, 0);

        return {
            day: dateArray.length > 7 ? dateStr : dayName,
            fullDate: dateStr,
            ventas: dailySales,
        };
    });
}

export function buildDashboardCategoryData(orders: Order[]): CategorySalesPoint[] {
    const catMap = new Map<string, number>();

    if (!orders || orders.length === 0) {
        return [];
    }

    orders.forEach((order) => {
        if (order.status === 'CANCELLED') return;

        const items = order.items || [];
        if (items.length === 0) {
            console.warn(`Order ${order.id} has no items`);
            return;
        }

        items.forEach((item) => {
            const product = item.product;
            let catName = 'Sin Categoría';

            if (product) {
                const runtimeCategory = readCategoryRuntimeValue(product);
                const runtimeCategoryName = readCategoryNameFromRuntime(runtimeCategory);
                const runtimeCategoryId = readCategoryIdFromRuntime(runtimeCategory);

                if (runtimeCategoryName) {
                    catName = runtimeCategoryName;
                } else if (runtimeCategoryId) {
                    catName = `ID: ${runtimeCategoryId}`;
                } else if (product.categoryId) {
                    catName = `ID: ${product.categoryId}`;
                } else if (typeof runtimeCategory === 'string') {
                    catName = runtimeCategory;
                } else {
                    catName = 'Sin Categoría';
                }
            } else {
                catName = 'Item sin Producto';
            }

            const quantity = item.quantity || 0;
            if (quantity > 0) {
                catMap.set(catName, (catMap.get(catName) || 0) + quantity);
            }
        });
    });

    return Array.from(catMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
}

export function calculateMarketingAttributionMetrics(
    orders: Order[],
    dateRange: DashboardDateRange | undefined
): MarketingAttributionMetrics {
    const from = dateRange?.from ? startOfDay(dateRange.from) : null;
    const to = dateRange?.to ? endOfDay(dateRange.to) : from ? endOfDay(from) : null;

    const ordersInRange = from && to
        ? orders.filter((order) => isWithinInterval(new Date(order.createdAt), { start: from, end: to }))
        : orders;

    const validOrders = ordersInRange.filter((order) => order.status !== 'CANCELLED');
    const totalSales = validOrders.reduce((acc, order) => acc + order.total, 0);

    const couponOrders = validOrders.filter((order) => !!order.couponId);
    const couponOrdersCount = couponOrders.length;
    const couponAttributedRevenue = couponOrders.reduce((acc, order) => acc + order.total, 0);
    const couponAttributedRevenueRate = totalSales > 0 ? (couponAttributedRevenue / totalSales) * 100 : 0;
    const couponOrdersRate = validOrders.length > 0 ? (couponOrdersCount / validOrders.length) * 100 : 0;

    return {
        couponAttributedRevenue,
        couponAttributedRevenueRate,
        couponOrdersCount,
        couponOrdersRate,
        validOrdersCount: validOrders.length,
    };
}
