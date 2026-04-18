'use client';

import { useCallback, useEffect, useState } from 'react';
import { User as Customer, Order, Address } from '@/types';
import { getUserById } from '@/services/userService';
import { fetchAdminUserCoupons, UserCouponRecord } from '@/services/couponService';

interface CustomerDrawerData {
    customer: Customer | null;
    orders: Order[];
    addresses: Address[];
    activeCoupons: UserCouponRecord[];
    usedCoupons: UserCouponRecord[];
    loading: boolean;
    error: string | null;
}

const EMPTY: CustomerDrawerData = {
    customer: null,
    orders: [],
    addresses: [],
    activeCoupons: [],
    usedCoupons: [],
    loading: false,
    error: null,
};

export function useCustomerDrawer({ userId, open }: { userId: string | null; open: boolean }) {
    const [data, setData] = useState<CustomerDrawerData>(EMPTY);

    const reset = useCallback(() => setData(EMPTY), []);

    useEffect(() => {
        if (!open || !userId) {
            reset();
            return;
        }

        let cancelled = false;

        const load = async () => {
            setData(prev => ({ ...prev, loading: true, error: null }));
            try {
                const [raw, couponRecords] = await Promise.all([
                    getUserById(userId),
                    fetchAdminUserCoupons(userId).catch(() => [] as UserCouponRecord[]),
                ]);

                const customer = raw as Customer;

                if (!cancelled) {
                    setData({
                        customer,
                        orders: customer.orders ?? [],
                        addresses: customer.addresses ?? [],
                        activeCoupons: couponRecords.filter(r => !r.isUsed),
                        usedCoupons: couponRecords.filter(r => r.isUsed),
                        loading: false,
                        error: null,
                    });
                }
            } catch {
                if (!cancelled) {
                    setData({ ...EMPTY, error: 'No se pudo cargar la información del cliente.' });
                }
            }
        };

        load();
        return () => { cancelled = true; };
    }, [open, userId, reset]);

    return data;
}
