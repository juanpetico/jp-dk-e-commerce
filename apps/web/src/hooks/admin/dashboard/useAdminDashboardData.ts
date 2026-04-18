import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { DashboardCartFunnel, DashboardCustomerRetention, DashboardRetentionRange, Order, Product } from '@/types';
import { fetchProducts } from '@/services/productService';
import { fetchAllOrders, fetchDashboardCartFunnel, fetchDashboardCustomerRetention } from '@/services/orderService';

interface UseAdminDashboardDataResult {
    products: Product[];
    orders: Order[];
    cartFunnel: DashboardCartFunnel | null;
    customerRetention: DashboardCustomerRetention | null;
    loadingCustomerRetention: boolean;
    setOrders: Dispatch<SetStateAction<Order[]>>;
    loading: boolean;
    error: string | null;
    reloadData: (retentionRange?: DashboardRetentionRange) => Promise<void>;
    reloadCustomerRetention: (range: DashboardRetentionRange) => Promise<void>;
}

export function useAdminDashboardData(): UseAdminDashboardDataResult {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [cartFunnel, setCartFunnel] = useState<DashboardCartFunnel | null>(null);
    const [customerRetention, setCustomerRetention] = useState<DashboardCustomerRetention | null>(null);
    const [loadingCustomerRetention, setLoadingCustomerRetention] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async (retentionRange: DashboardRetentionRange = '1M') => {
        try {
            setError(null);
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
            setError('Error al cargar datos del dashboard');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadCustomerRetention = useCallback(async (range: DashboardRetentionRange) => {
        try {
            setLoadingCustomerRetention(true);
            const customerRetentionData = await fetchDashboardCustomerRetention(range);
            setCustomerRetention(customerRetentionData);
        } catch (error) {
            console.error('Error loading customer retention data:', error);
            setError('Error al cargar datos de retencion de clientes');
        } finally {
            setLoadingCustomerRetention(false);
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
        loadingCustomerRetention,
        setOrders,
        loading,
        error,
        reloadData: loadData,
        reloadCustomerRetention: loadCustomerRetention,
    };
}
