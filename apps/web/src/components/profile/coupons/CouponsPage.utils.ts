import { Coupon } from '@/types';

export const formatCouponValue = (coupon: Coupon) => {
    if (coupon.type === 'PERCENTAGE') {
        return `${coupon.value}%`;
    }

    return `$${coupon.value.toLocaleString('es-CL')}`;
};

export const getCouponExpiryLabel = (endDate?: string | Date | null) => {
    if (!endDate) {
        return 'Uso ilimitado (Sin expiracion)';
    }

    return `Expira el ${new Date(endDate).toLocaleDateString('es-CL')}`;
};
