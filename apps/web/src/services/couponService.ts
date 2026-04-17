import { Coupon } from '../types';

export interface UserCouponRecord {
    id: string;
    isUsed: boolean;
    assignedAt: string;
    coupon: Coupon;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };

/**
 * Obtener todos los cupones
 */
export const fetchAllCoupons = async (): Promise<Coupon[]> => {
    try {
        const res = await fetch(`${API_URL}/coupons`, {
            credentials: 'include',
            headers: JSON_HEADERS,
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
            credentials: 'include',
            headers: JSON_HEADERS,
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
            credentials: 'include',
            headers: JSON_HEADERS,
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
            credentials: 'include',
            headers: JSON_HEADERS,
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
            credentials: 'include',
            headers: JSON_HEADERS,
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

export const fetchAdminUserCoupons = async (userId: string): Promise<UserCouponRecord[]> => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/coupons`, {
        credentials: 'include',
        headers: JSON_HEADERS,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) throw new Error(json.message || 'No se pudieron obtener los cupones del usuario');
    return json.data as UserCouponRecord[];
};
