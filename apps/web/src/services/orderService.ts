import { DashboardCartFunnel, DashboardCustomerRetention, DashboardRetentionRange, Order, OrderStatus, TopProduct } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };

/**
 * Obtener todas las órdenes (solo para admin)
 */
export const fetchAllOrders = async (filters?: {
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
    search?: string;
}): Promise<Order[]> => {
    try {
        // Construir query string con filtros
        const queryParams = new URLSearchParams();

        if (filters?.status) {
            queryParams.append('status', filters.status);
        }
        if (filters?.startDate) {
            queryParams.append('startDate', filters.startDate);
        }
        if (filters?.endDate) {
            queryParams.append('endDate', filters.endDate);
        }
        if (filters?.search) {
            queryParams.append('search', filters.search);
        }

        const queryString = queryParams.toString();
        const url = `${API_URL}/orders/all/admin${queryString ? `?${queryString}` : ''}`;

        const res = await fetch(url, {
            credentials: 'include',
            headers: JSON_HEADERS,
        });

        if (!res.ok) {
            throw new Error('Failed to fetch orders');
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

/**
 * Obtener órdenes del usuario autenticado
 */
export const fetchUserOrders = async (): Promise<Order[]> => {
    try {
        const res = await fetch(`${API_URL}/orders`, {
            credentials: 'include',
            headers: JSON_HEADERS,
        });

        if (!res.ok) {
            throw new Error('Failed to fetch user orders');
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }
};

/**
 * Obtener una orden específica por ID
 */
export const fetchOrderById = async (orderId: string): Promise<Order> => {
    try {
        const res = await fetch(`${API_URL}/orders/${orderId}`, {
            credentials: 'include',
            headers: JSON_HEADERS,
        });

        if (!res.ok) {
            throw new Error('Failed to fetch order');
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
};

/**
 * Actualizar el estado de una orden (solo admin)
 */
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
    try {
        const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            credentials: 'include',
            headers: JSON_HEADERS,
            body: JSON.stringify({ status }),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update order status');
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

/**
 * Marcar una orden como pagada (solo admin)
 */
export const markOrderAsPaid = async (orderId: string): Promise<Order> => {
    try {
        const res = await fetch(`${API_URL}/orders/${orderId}/pay`, {
            method: 'POST',
            credentials: 'include',
            headers: JSON_HEADERS,
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to mark order as paid');
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error marking order as paid:', error);
        throw error;
    }
};

/**
 * Cancelar una orden
 */
export const cancelOrder = async (orderId: string): Promise<Order> => {
    try {
        const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
            method: 'POST',
            credentials: 'include',
            headers: JSON_HEADERS,
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to cancel order');
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
    }
};

/**
 * Mapeo de estados del backend a español
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
};

/**
 * Obtener el color para cada estado
 */
export const getOrderStatusColor = (status: OrderStatus): string => {
    const colors: Record<OrderStatus, string> = {
        PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50',
        CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50',
        DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50',
        CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50',
    };
    return colors[status] || colors.PENDING;
};

/**
 * Validar un cupón
 */
export const validateCoupon = async (code: string, total: number): Promise<any> => {
    try {
        const res = await fetch(`${API_URL}/coupons/validate`, {
            method: 'POST',
            credentials: 'include',
            headers: JSON_HEADERS,
            body: JSON.stringify({ code, total }),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Cupón inválido');
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        // No loguear errores de validación, ya que son manejados en la UI
        throw error;
    }
};

/**
 * Crear una nueva orden
 */
export const createOrder = async (
    items: { productId: string; quantity: number; size: string }[],
    shippingAddressId?: string,
    billingAddressId?: string,
    couponCode?: string
): Promise<Order> => {
    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            credentials: 'include',
            headers: JSON_HEADERS,
            body: JSON.stringify({ items, shippingAddressId, billingAddressId, couponCode }),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to create order');
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

/**
 * Obtener los productos más vendidos (Top Performers)
 */
export const fetchTopProducts = async (limit: number = 5): Promise<TopProduct[]> => {
    try {
        const res = await fetch(`${API_URL}/orders/top-products?limit=${limit}`, {
            credentials: 'include',
            headers: JSON_HEADERS,
        });

        if (!res.ok) {
            throw new Error('Failed to fetch top products');
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching top products:', error);
        throw error;
    }
};

/**
 * Obtener KPI de embudo de carritos (admin)
 */
export const fetchDashboardCartFunnel = async (): Promise<DashboardCartFunnel> => {
    try {
        const res = await fetch(`${API_URL}/orders/cart-funnel`, {
            credentials: 'include',
            headers: JSON_HEADERS,
        });

        if (!res.ok) {
            throw new Error('Failed to fetch cart funnel data');
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching cart funnel data:', error);
        throw error;
    }
};

/**
 * Obtener KPI de retención de clientes (admin)
 */
export const fetchDashboardCustomerRetention = async (
    range: DashboardRetentionRange = '1M'
): Promise<DashboardCustomerRetention> => {
    try {
        const res = await fetch(`${API_URL}/orders/customer-retention?range=${range}`, {
            credentials: 'include',
            headers: JSON_HEADERS,
        });

        if (!res.ok) {
            throw new Error('Failed to fetch customer retention data');
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching customer retention data:', error);
        throw error;
    }
};
