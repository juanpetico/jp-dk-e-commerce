import { useMemo, useState } from 'react';
import { DashboardDateRange, DashboardQuickRange } from '@/lib/dashboard/types';
import {
    DASHBOARD_QUICK_RANGES,
    resolveDashboardQuickRange,
} from '@/lib/dashboard/dateRanges';

export function useDashboardDateRange() {
    const defaultQuickRange: DashboardQuickRange = '1M';
    const defaultDateRange = useMemo(() => resolveDashboardQuickRange(defaultQuickRange), []);
    const [dateRange, setDateRange] = useState<DashboardDateRange | undefined>(defaultDateRange);
    const [selectedQuickRange, setSelectedQuickRange] = useState<DashboardQuickRange | null>(defaultQuickRange);

    const setQuickRange = (range: DashboardQuickRange) => {
        if (selectedQuickRange === range) {
            setDateRange(defaultDateRange);
            setSelectedQuickRange(null);
            return;
        }

        setSelectedQuickRange(range);
        setDateRange(resolveDashboardQuickRange(range));
    };

    const handleDateRangeChange = (newRange: DashboardDateRange | undefined) => {
        setDateRange(newRange);
        setSelectedQuickRange(null);
    };

    return {
        dateRange,
        defaultDateRange,
        selectedQuickRange,
        setQuickRange,
        setDateRange: handleDateRangeChange,
        quickRanges: DASHBOARD_QUICK_RANGES,
    };
}
