import { Coupon } from '../types';

const API_URL = 'http://localhost:5001/api';

// Helper para obtener el token de autenticación
const getAuthHeaders = (): HeadersInit => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Obtener todos los cupones
 */
export const fetchAllCoupons = async (): Promise<Coupon[]> => {
    try {
        const res = await fetch(`${API_URL}/coupons`, {
            headers: getAuthHeaders(),
        });

        if (!res.ok) {
            throw new Error('Failed to fetch coupons');
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching coupons:', error);
        throw error;
    }
};

/**
 * Crear un nuevo cupón
 */
export const createCoupon = async (couponData: Partial<Coupon>): Promise<Coupon> => {
    try {
        const res = await fetch(`${API_URL}/coupons`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(couponData),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to create coupon');
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error creating coupon:', error);
        throw error;
    }
};

/**
 * Actualizar un cupón existente
 */
export const updateCoupon = async (id: string, couponData: Partial<Coupon>): Promise<Coupon> => {
    try {
        const res = await fetch(`${API_URL}/coupons/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(couponData),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update coupon');
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error updating coupon:', error);
        throw error;
    }
};

/**
 * Eliminar un cupón
 */
export const deleteCoupon = async (id: string): Promise<void> => {
    try {
        const res = await fetch(`${API_URL}/coupons/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!res.ok) {
            throw new Error('Failed to delete coupon');
        }
    } catch (error) {
        console.error('Error deleting coupon:', error);
        throw error;
    }
};

/**
 * Obtener los cupones activos del usuario (Billetera)
 */
export const fetchMyCoupons = async (): Promise<any[]> => {
    try {
        const res = await fetch(`${API_URL}/coupons/my-coupons`, {
            headers: getAuthHeaders(),
        });

        if (!res.ok) {
            throw new Error('Failed to fetch user coupons');
        }

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching user coupons:', error);
        throw error;
    }
};
