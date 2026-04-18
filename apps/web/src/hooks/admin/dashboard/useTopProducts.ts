import { useCallback, useEffect, useState } from 'react';
import { TopProduct } from '@/types';
import { fetchTopProducts } from '@/services/orderService';

const TOP_PRODUCTS_LIMIT = 50;

export function useTopProducts() {
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTopProducts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchTopProducts(TOP_PRODUCTS_LIMIT);
            setTopProducts(data);
        } catch (error) {
            console.error('Error loading top products:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadTopProducts();
    }, [loadTopProducts]);

    return {
        topProducts,
        loading,
        reloadTopProducts: loadTopProducts,
    };
}
