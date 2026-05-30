import { useCallback, useEffect, useMemo, useState } from 'react';
import { TopProduct } from '@/types';
import { fetchTopProducts } from '@/services/orderService';
import {
    DashboardTopProductsRange,
    DASHBOARD_TOP_PRODUCTS_RANGES,
    resolveTopProductsDateRange,
} from '@/lib/dashboard/dateRanges';

const TOP_PRODUCTS_LIMIT = 50;

export function useTopProducts() {
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState<DashboardTopProductsRange>('1M');

    const dateRange = useMemo(() => resolveTopProductsDateRange(selectedRange), [selectedRange]);

    const loadTopProducts = useCallback(async (from?: Date, to?: Date) => {
        try {
            setLoading(true);
            const data = await fetchTopProducts(TOP_PRODUCTS_LIMIT, from, to);
            setTopProducts(data);
        } catch (error) {
            console.error('Error loading top products:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadTopProducts(dateRange?.from, dateRange?.to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadTopProducts, dateRange?.from?.toISOString(), dateRange?.to?.toISOString()]);

    return {
        topProducts,
        loading,
        selectedRange,
        setSelectedRange,
        availableRanges: DASHBOARD_TOP_PRODUCTS_RANGES,
        reloadTopProducts: loadTopProducts,
    };
}
