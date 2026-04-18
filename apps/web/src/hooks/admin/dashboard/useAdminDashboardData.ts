import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DashboardCartFunnel, DashboardCustomerRetention, DashboardRetentionRange, Order, Product } from '@/types';
import { fetchProducts } from '@/services/productService';
import { fetchAllOrders, fetchDashboardCartFunnel, fetchDashboardCustomerRetention } from '@/services/orderService';

export function useAdminDashboardData() {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [cartFunnel, setCartFunnel] = useState<DashboardCartFunnel | null>(null);
    const [customerRetention, setCustomerRetention] = useState<DashboardCustomerRetention | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async (retentionRange: DashboardRetentionRange = '1M') => {
        try {
            setLoading(true);
            const [productsData, ordersData, cartFunnelData, customerRetentionData] = await Promise.all([
                fetchProducts(),
                fetchAllOrders(),
                fetchDashboardCartFunnel(),
                fetchDashboardCustomerRetention(retentionRange),
            ]);
            setProducts(productsData);
            setOrders(ordersData || []);
            setCartFunnel(cartFunnelData);
            setCustomerRetention(customerRetentionData);
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
        customerRetention,
        setOrders,
        loading,
        reloadData: loadData,
    };
}
