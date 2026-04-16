import { useMemo, useState } from 'react';
import { DashboardDateRange, DashboardQuickRange } from '@/lib/dashboard/types';
import {
    DASHBOARD_QUICK_RANGES,
    getDefaultDashboardDateRange,
    resolveDashboardQuickRange,
} from '@/lib/dashboard/dateRanges';

export function useDashboardDateRange() {
    const defaultDateRange = useMemo(() => getDefaultDashboardDateRange(), []);
    const [dateRange, setDateRange] = useState<DashboardDateRange | undefined>(defaultDateRange);
    const [selectedQuickRange, setSelectedQuickRange] = useState<DashboardQuickRange | null>(null);

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
