const API_URL = 'http://localhost:5001/api';

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
        const res = await fetch(`${API_URL}/shop-config`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Error al obtener la configuración');
        const json = await res.json();
        return json.data;
    },

    async updateConfig(data: Partial<StoreConfig>): Promise<StoreConfig> {
        const res = await fetch(`${API_URL}/shop-config`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
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
