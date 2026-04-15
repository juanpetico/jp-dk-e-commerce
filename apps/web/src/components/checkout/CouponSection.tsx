'use client';

import React from 'react';
import { Coupon } from '@/types';
import { ShieldCheck, Ticket, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CouponSectionProps {
    appliedCoupon: Coupon | null;
    couponCode: string;
    setCouponCode: (code: string) => void;
    isValidatingCoupon: boolean;
    onApplyCoupon: () => void;
    onRemoveCoupon: () => void;
    userCoupons: any[];
    showWallet: boolean;
    setShowWallet: (show: boolean) => void;
}

export function CouponSection({
    appliedCoupon,
    couponCode,
    setCouponCode,
    isValidatingCoupon,
    onApplyCoupon,
    onRemoveCoupon,
    userCoupons,
    showWallet,
    setShowWallet,
}: CouponSectionProps) {
    return (
        <div className="mb-8 border-b border-border pb-8">
            {!appliedCoupon ? (
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Código de descuento"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 bg-background border border-border rounded-none border-t-0 border-r-0 border-l-0 border-b-2 px-0 py-2 text-sm focus:border-foreground focus:ring-0 focus:outline-none transition-colors placeholder:text-muted-foreground/70"
                    />
                    <Button
                        variant="outline"
                        className="font-bold border-2"
                        onClick={onApplyCoupon}
                        disabled={isValidatingCoupon || !couponCode.trim()}
                    >
                        {isValidatingCoupon ? '...' : 'Usar'}
                    </Button>
                </div>
            ) : (
                <div className="flex items-center justify-between bg-primary/5 border border-primary/20 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <div>
                            <p className="text-sm font-bold text-primary">{appliedCoupon.code}</p>
                            <p className="text-[11px] font-medium text-primary/80">
                                {appliedCoupon.type === 'PERCENTAGE'
                                    ? `${appliedCoupon.value}% OFF`
                                    : `$${appliedCoupon.value.toLocaleString('es-CL')} OFF`
                                }
                            </p>
                            <p className="text-[10px] text-muted-foreground">{appliedCoupon.description || 'Descuento aplicado'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onRemoveCoupon}
                        className="text-muted-foreground hover:text-destructive transition-colors text-xs font-bold underline"
                    >
                        Quitar
                    </button>
                </div>
            )}

            {/* Wallet Selector */}
            {!appliedCoupon && userCoupons.length > 0 && (
                <div className="mt-4">
                    <button
                        onClick={() => setShowWallet(!showWallet)}
                        className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
                    >
                        <Ticket className="w-4 h-4" />
                        {showWallet ? 'Ocultar mis cupones' : 'Ver mis cupones disponibles'}
                        {showWallet ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {showWallet && (
                        <div className="mt-3 space-y-2 animate-in slide-in-from-top-1 duration-200">
                            {userCoupons.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setCouponCode(item.coupon.code);
                                        setShowWallet(false);
                                    }}
                                    className="w-full text-left p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-black tracking-tight">{item.coupon.code}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {item.coupon.type === 'PERCENTAGE' ? `${item.coupon.value}%` : `$${item.coupon.value.toLocaleString('es-CL')}`} de descuento
                                            </p>
                                        </div>
                                        <div className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            SELECCIONAR
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
