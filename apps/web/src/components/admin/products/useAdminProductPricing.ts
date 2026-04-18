'use client';

import { useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { FormProduct } from './AdminProductForm.types';
import { parseNumericInput } from './AdminProductForm.utils';

type FieldName = 'price' | 'originalPrice' | 'helperDiscount' | 'isSale';

export function useAdminProductPricing() {
    const toastShownRef = useRef<{ reversion: boolean; priceExceeded: boolean }>({
        reversion: false,
        priceExceeded: false,
    });

    const applyFieldPricingRules = useCallback((prev: FormProduct, next: FormProduct, name: FieldName) => {
        if (name === 'isSale' && next.isSale === false && prev.originalPrice) {
            next.price = prev.originalPrice;
            next.originalPrice = '';
            next.helperDiscount = '';
            next.discountPercent = undefined;

            if (!toastShownRef.current.reversion) {
                toastShownRef.current.reversion = true;
                toast.success('El precio ha vuelto a su valor original');
                setTimeout(() => {
                    toastShownRef.current.reversion = false;
                }, 1000);
            }
        } else if (name === 'isSale' && next.isSale === false) {
            next.originalPrice = '';
            next.helperDiscount = '';
            next.discountPercent = undefined;
        }

        if (name === 'helperDiscount' && next.isSale) {
            const rawOriginalPrice = parseNumericInput(next.originalPrice);
            const rawDiscount = parseNumericInput(next.helperDiscount);

            if (rawOriginalPrice && rawDiscount && rawDiscount > 0 && rawDiscount <= 100) {
                const calculatedPrice = Math.round(rawOriginalPrice * (1 - rawDiscount / 100));
                next.price = new Intl.NumberFormat('es-CL').format(calculatedPrice);
                next.discountPercent = rawDiscount;
            }
        }

        if (name === 'originalPrice' && next.isSale) {
            const rawOriginalPrice = parseNumericInput(next.originalPrice);
            const rawPrice = parseNumericInput(next.price);

            if (rawOriginalPrice && rawPrice && rawOriginalPrice > rawPrice) {
                const calculatedDiscount = Math.round(((rawOriginalPrice - rawPrice) / rawOriginalPrice) * 100);
                if (calculatedDiscount >= 0 && calculatedDiscount <= 100) {
                    next.helperDiscount = calculatedDiscount.toString();
                    next.discountPercent = calculatedDiscount;
                }
            }
        }

        if (name === 'price' && next.isSale && next.originalPrice) {
            const rawOriginalPrice = parseNumericInput(next.originalPrice);
            const rawPrice = parseNumericInput(next.price);

            if (rawOriginalPrice && rawPrice) {
                if (rawPrice >= rawOriginalPrice) {
                    next.price = prev.price;
                    if (!toastShownRef.current.priceExceeded) {
                        toastShownRef.current.priceExceeded = true;
                        toast.error('El precio no puede ser mayor o igual al precio original');
                        setTimeout(() => {
                            toastShownRef.current.priceExceeded = false;
                        }, 500);
                    }
                } else if (rawOriginalPrice > 0) {
                    const calculatedDiscount = Math.round(((rawOriginalPrice - rawPrice) / rawOriginalPrice) * 100);
                    if (calculatedDiscount >= 0 && calculatedDiscount <= 100) {
                        next.helperDiscount = calculatedDiscount.toString();
                        next.discountPercent = calculatedDiscount;
                    }
                }
            }
        }

        return next;
    }, []);

    return {
        applyFieldPricingRules,
    };
}
