import { differenceInDays, endOfDay, startOfDay, startOfYear, subDays, subMonths, subYears } from 'date-fns';
import { DashboardDateRange, DashboardQuickRange } from './types';

export const DASHBOARD_QUICK_RANGES: DashboardQuickRange[] = ['1D', '7D', '1M', '6M', 'YTD', '1Y', 'ALL'];

export type DashboardTopProductsRange = '1M' | '3M' | '6M' | 'ALL';
export const DASHBOARD_TOP_PRODUCTS_RANGES: DashboardTopProductsRange[] = ['1M', '3M', '6M', 'ALL'];

export function getDefaultDashboardDateRange(baseDate: Date = new Date()): DashboardDateRange {
    return {
        from: subDays(baseDate, 6),
        to: baseDate,
    };
}

export function resolveDashboardQuickRange(
    range: DashboardQuickRange,
    baseDate: Date = new Date()
): DashboardDateRange {
    const today = baseDate;
    const to = endOfDay(today);
    let from: Date;

    switch (range) {
        case '1D':
            from = startOfDay(subDays(today, 1));
            break;
        case '7D':
            from = startOfDay(subDays(today, 7));
            break;
        case '1M':
            from = startOfDay(subMonths(today, 1));
            break;
        case '6M':
            from = startOfDay(subMonths(today, 6));
            break;
        case 'YTD':
            from = startOfYear(today);
            break;
        case '1Y':
            from = startOfDay(subYears(today, 1));
            break;
        case 'ALL':
            from = startOfDay(subYears(today, 5));
            break;
    }

    return { from, to };
}

export function resolveTopProductsDateRange(
    range: DashboardTopProductsRange,
    baseDate: Date = new Date()
): DashboardDateRange | undefined {
    if (range === 'ALL') return undefined;
    const to = endOfDay(baseDate);
    let from: Date;
    switch (range) {
        case '1M': from = startOfDay(subMonths(baseDate, 1)); break;
        case '3M': from = startOfDay(subMonths(baseDate, 3)); break;
        case '6M': from = startOfDay(subMonths(baseDate, 6)); break;
    }
    return { from, to };
}

export function calculatePreviousPeriod(dateRange: DashboardDateRange): DashboardDateRange {
    const from = dateRange.from!;
    const to = dateRange.to ?? from;
    const durationDays = differenceInDays(to, from) + 1;
    return {
        from: subDays(from, durationDays),
        to: subDays(from, 1),
    };
}
