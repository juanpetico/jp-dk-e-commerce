import { Order, OrderStatus } from '../types';

const API_URL = 'http://localhost:5001/api';

// Helper para obtener el token de autenticación
const getAuthHeaders = (): HeadersInit => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

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
            headers: getAuthHeaders(),
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
            headers: getAuthHeaders(),
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
            headers: getAuthHeaders(),
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
            headers: getAuthHeaders(),
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
            headers: getAuthHeaders(),
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
            headers: getAuthHeaders(),
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
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
};

/**
 * Obtener el color para cada estado
 */
export const getOrderStatusColor = (status: OrderStatus): string => {
    const colors: Record<OrderStatus, string> = {
        PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        DELIVERED: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        CANCELLED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
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
            headers: getAuthHeaders(),
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
            headers: getAuthHeaders(),
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
