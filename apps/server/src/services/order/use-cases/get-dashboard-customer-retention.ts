import prisma from "../../../config/prisma.js";
import type { OrderStatus } from "@prisma/client";

const COMPLETED_ORDER_STATUSES: OrderStatus[] = ["CONFIRMED", "DELIVERED"];

export type DashboardRetentionRange = "1D" | "7D" | "1M";

interface DashboardCustomerRetentionRevenueSplit {
    newRevenue: number;
    repeatRevenue: number;
    totalRevenue: number;
}

export interface DashboardCustomerRetentionMetrics {
    range: DashboardRetentionRange;
    from: string;
    to: string;
    retentionRate: number;
    previousRetentionRate: number;
    retentionGrowth: number;
    activeCustomers: number;
    newCustomers: number;
    repeatCustomers: number;
    revenueSplit: DashboardCustomerRetentionRevenueSplit;
}

interface PeriodRange {
    start: Date;
    end: Date;
}

interface PeriodMetrics {
    retentionRate: number;
    activeCustomers: number;
    newCustomers: number;
    repeatCustomers: number;
    revenueSplit: DashboardCustomerRetentionRevenueSplit;
}

const resolvePeriodRange = (range: DashboardRetentionRange, baseDate: Date = new Date()): PeriodRange => {
    const now = toEndOfDay(baseDate);

    switch (range) {
        case "1D":
            return { start: toStartOfDay(addDays(now, -1)), end: now };
        case "7D":
            return { start: toStartOfDay(addDays(now, -7)), end: now };
        case "1M":
        default:
            return { start: toStartOfDay(addMonths(now, -1)), end: now };
    }
};

const resolvePreviousPeriodRange = ({ start, end }: PeriodRange): PeriodRange => {
    const durationMs = end.getTime() - start.getTime();
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - durationMs);

    return {
        start: toStartOfDay(previousStart),
        end: toEndOfDay(previousEnd),
    };
};

const toStartOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

const toEndOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
};

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const addMonths = (date: Date, months: number): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};

const calculatePeriodMetrics = async (period: PeriodRange): Promise<PeriodMetrics> => {
    const periodOrders = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: period.start,
                lte: period.end,
            },
            status: { in: COMPLETED_ORDER_STATUSES },
        },
        select: {
            userId: true,
            total: true,
        },
    });

    if (periodOrders.length === 0) {
        return {
            retentionRate: 0,
            activeCustomers: 0,
            newCustomers: 0,
            repeatCustomers: 0,
            revenueSplit: {
                newRevenue: 0,
                repeatRevenue: 0,
                totalRevenue: 0,
            },
        };
    }

    const activeCustomerIds = Array.from(new Set(periodOrders.map((order) => order.userId)));
    const returningBeforePeriod = await prisma.order.findMany({
        where: {
            userId: { in: activeCustomerIds },
            createdAt: { lt: period.start },
            status: { in: COMPLETED_ORDER_STATUSES },
        },
        distinct: ["userId"],
        select: {
            userId: true,
        },
    });

    const repeatUserIds = new Set(returningBeforePeriod.map((order) => order.userId));

    let repeatRevenue = 0;
    let newRevenue = 0;

    periodOrders.forEach((order) => {
        if (repeatUserIds.has(order.userId)) {
            repeatRevenue += order.total;
            return;
        }

        newRevenue += order.total;
    });

    const repeatCustomers = activeCustomerIds.filter((userId) => repeatUserIds.has(userId)).length;
    const activeCustomers = activeCustomerIds.length;
    const newCustomers = activeCustomers - repeatCustomers;

    return {
        retentionRate: activeCustomers > 0 ? (repeatCustomers / activeCustomers) * 100 : 0,
        activeCustomers,
        newCustomers,
        repeatCustomers,
        revenueSplit: {
            newRevenue,
            repeatRevenue,
            totalRevenue: newRevenue + repeatRevenue,
        },
    };
};

export const getDashboardCustomerRetentionUseCase = async (
    range: DashboardRetentionRange = "1M"
): Promise<DashboardCustomerRetentionMetrics> => {
    const period = resolvePeriodRange(range);
    const previousPeriod = resolvePreviousPeriodRange(period);

    const [current, previous] = await Promise.all([
        calculatePeriodMetrics(period),
        calculatePeriodMetrics(previousPeriod),
    ]);

    return {
        range,
        from: period.start.toISOString(),
        to: period.end.toISOString(),
        retentionRate: current.retentionRate,
        previousRetentionRate: previous.retentionRate,
        retentionGrowth: current.retentionRate - previous.retentionRate,
        activeCustomers: current.activeCustomers,
        newCustomers: current.newCustomers,
        repeatCustomers: current.repeatCustomers,
        revenueSplit: current.revenueSplit,
    };
};
