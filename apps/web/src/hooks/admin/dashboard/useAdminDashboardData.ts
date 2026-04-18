import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DashboardCartFunnel, Order, Product } from '@/types';
import { fetchProducts } from '@/services/productService';
import { fetchAllOrders, fetchDashboardCartFunnel } from '@/services/orderService';

export function useAdminDashboardData() {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [cartFunnel, setCartFunnel] = useState<DashboardCartFunnel | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [productsData, ordersData, cartFunnelData] = await Promise.all([
                fetchProducts(),
                fetchAllOrders(),
                fetchDashboardCartFunnel(),
            ]);
            setProducts(productsData);
            setOrders(ordersData || []);
            setCartFunnel(cartFunnelData);
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
        cartFunnel,
        setOrders,
        loading,
        reloadData: loadData,
    };
}
