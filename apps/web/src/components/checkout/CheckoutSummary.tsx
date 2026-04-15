'use client';

import React from 'react';
import { Coupon, CartItem } from '@/types';
import { CouponSection } from './CouponSection';

interface CheckoutSummaryProps {
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    isFreeShipping: boolean;
    freeShippingThreshold: number;
    appliedCoupon: Coupon | null;
    couponDiscount: number;
    finalTotal: number;
    // Coupon props
    couponCode: string;
    setCouponCode: (code: string) => void;
    isValidatingCoupon: boolean;
    onApplyCoupon: () => void;
    onRemoveCoupon: () => void;
    userCoupons: any[];
    showWallet: boolean;
    setShowWallet: (show: boolean) => void;
}

export function CheckoutSummary({
    items,
    subtotal,
    shippingCost,
    isFreeShipping,
    freeShippingThreshold,
    appliedCoupon,
    couponDiscount,
    finalTotal,
    couponCode,
    setCouponCode,
    isValidatingCoupon,
    onApplyCoupon,
    onRemoveCoupon,
    userCoupons,
    showWallet,
    setShowWallet,
}: CheckoutSummaryProps) {
    const savedAmount = items.reduce(
        (acc, item) => acc + ((item.originalPrice || item.price) - item.price) * item.quantity,
        0
    );

    return (
        <div className="lg:col-span-5 bg-muted/20 px-4 py-8 md:px-8 lg:px-10 lg:py-8 order-1 lg:order-2 border-l border-border h-full lg:min-h-screen">
            <div className="max-w-md mr-auto ml-auto lg:ml-0 sticky top-8">
                {/* Items List */}
                <div className="mb-6">
                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        {items.map(item => (
                            <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 items-center">
                                <div className="relative w-16 h-16 bg-card border border-border rounded-md overflow-hidden flex-shrink-0">
                                    <img src={item.images[0]?.url} className="w-full h-full object-cover" alt={item.name} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground truncate">{item.name}</p>
                                    <p className="text-xs text-muted-foreground font-medium">{item.selectedSize}</p>
                                    <p className="text-xs text-muted-foreground font-medium mt-1">Cantidad: {item.quantity}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="text-sm font-bold text-foreground font-mono">
                                        ${item.price.toLocaleString('es-CL')}
                                    </div>
                                    {item.originalPrice && item.originalPrice > item.price && (
                                        <div className="text-[10px] text-muted-foreground line-through font-mono">
                                            ${item.originalPrice.toLocaleString('es-CL')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coupon Section */}
                <CouponSection
                    appliedCoupon={appliedCoupon}
                    couponCode={couponCode}
                    setCouponCode={setCouponCode}
                    isValidatingCoupon={isValidatingCoupon}
                    onApplyCoupon={onApplyCoupon}
                    onRemoveCoupon={onRemoveCoupon}
                    userCoupons={userCoupons}
                    showWallet={showWallet}
                    setShowWallet={setShowWallet}
                />

                {/* Totals */}
                <div className="space-y-3 text-sm text-foreground/80 mb-6">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium text-foreground">${subtotal.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="flex items-center gap-1">Envío</span>
                        {isFreeShipping ? (
                            <span className="font-bold text-green-600 dark:text-green-400">¡Gratis!</span>
                        ) : (
                            <span className="font-medium text-foreground">${shippingCost.toLocaleString('es-CL')}</span>
                        )}
                    </div>

                    {appliedCoupon && (
                        <div className="flex justify-between text-primary font-bold">
                            <span className="flex items-center gap-1">Descuento ({appliedCoupon.code})</span>
                            <span>-${couponDiscount.toLocaleString('es-CL')}</span>
                        </div>
                    )}

                    {/* Savings Display */}
                    {savedAmount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400 font-bold">
                            <span>Ahorrado</span>
                            <span>-${savedAmount.toLocaleString('es-CL')}</span>
                        </div>
                    )}
                </div>

                {/* Free shipping progress hint */}
                {!isFreeShipping && (
                    <div className="mb-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                        <p className="text-[11px] text-muted-foreground font-medium text-center">
                            🚚 ¡Envío gratis en compras desde ${freeShippingThreshold.toLocaleString('es-CL')}!
                        </p>
                    </div>
                )}

                <div className="border-t-2 border-dashed border-border pt-4">
                    <div className="flex justify-between items-end">
                        <span className="text-xl font-bold text-foreground">Total</span>
                        <div className="text-right flex items-baseline gap-2">
                            <span className="text-xs text-muted-foreground font-bold">CLP</span>
                            <span className="text-3xl font-black text-foreground tracking-tight">${finalTotal.toLocaleString('es-CL')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
