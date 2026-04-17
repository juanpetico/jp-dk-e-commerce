import { useEffect } from 'react';
import { CartItem, Coupon } from '@/types';
import { APPLIED_COUPON_KEY, BUY_NOW_ITEM_KEY } from './CartContext.utils';

type Setter<T> = (value: T) => void;

const loadFromStorage = <T>(storageKey: string, onSuccess: Setter<T>, errorMessage: string) => {
    const rawValue = localStorage.getItem(storageKey);
    if (!rawValue) {
        return;
    }

    try {
        onSuccess(JSON.parse(rawValue) as T);
    } catch (error) {
        console.error(errorMessage, error);
    }
};

export const useCouponPersistence = (appliedCoupon: Coupon | null, setAppliedCoupon: Setter<Coupon | null>) => {
    useEffect(() => {
        loadFromStorage<Coupon>(APPLIED_COUPON_KEY, setAppliedCoupon, 'Failed to parse appliedCoupon');
    }, [setAppliedCoupon]);

    useEffect(() => {
        if (appliedCoupon) {
            localStorage.setItem(APPLIED_COUPON_KEY, JSON.stringify(appliedCoupon));
            return;
        }

        localStorage.removeItem(APPLIED_COUPON_KEY);
    }, [appliedCoupon]);
};

export const useBuyNowItemPersistence = (buyNowItem: CartItem | null, setBuyNowItem: Setter<CartItem | null>) => {
    useEffect(() => {
        loadFromStorage<CartItem>(BUY_NOW_ITEM_KEY, setBuyNowItem, 'Failed to parse buyNowItem');
    }, [setBuyNowItem]);

    useEffect(() => {
        if (buyNowItem) {
            localStorage.setItem(BUY_NOW_ITEM_KEY, JSON.stringify(buyNowItem));
            return;
        }

        localStorage.removeItem(BUY_NOW_ITEM_KEY);
    }, [buyNowItem]);
};
