import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Order, Product } from '@/types';
import { fetchProducts } from '@/services/productService';
import { fetchAllOrders } from '@/services/orderService';

export function useAdminDashboardData() {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [productsData, ordersData] = await Promise.all([
                fetchProducts(),
                fetchAllOrders(),
            ]);
            setProducts(productsData);
            setOrders(ordersData || []);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            toast.error('Error al cargar datos del dashboard');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    return {
        products,
        orders,
        setOrders,
        loading,
        reloadData: loadData,
    };
}
