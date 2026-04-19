import { apiFetch } from '@/lib/apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };

export interface StoreConfig {
    id: string;
    // Rewards
    welcomeCouponCode: string;
    welcomeCouponType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    welcomeCouponValue: number;
    vipThreshold: number;
    vipCouponCode: string;
    vipCouponType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    vipCouponValue: number;
    vipRewardMessage: string;
    // Logistics
    freeShippingThreshold: number;
    baseShippingCost: number;
    // Business Rules
    defaultTaxRate: number;
    lowStockThreshold: number;
    // Branding
    storeName: string;
    supportEmail: string;
    maintenanceMode: boolean;
    updatedAt: string;
}

export const shopConfigService = {
    async getConfig(): Promise<StoreConfig> {
        const res = await apiFetch(`${API_URL}/shop-config/public`, {
            headers: JSON_HEADERS,
        });
        if (!res.ok) throw new Error('Error al obtener la configuración');
        const json = await res.json();
        return json.data;
    },

    async updateConfig(data: Partial<StoreConfig>): Promise<StoreConfig> {
        const res = await apiFetch(`${API_URL}/shop-config`, {
            method: 'PATCH',
            credentials: 'include',
            headers: JSON_HEADERS,
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Error al actualizar la configuración');
        }
        const json = await res.json();
        return json.data;
    },
};
