'use client';

import React, { useState } from 'react';
import { Button } from '../../../src/components/ui/Button';
import { PlusCircle, Plus } from 'lucide-react';

interface Coupon {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    value: number;
    usageLimit: number;
    usedCount: number;
    status: 'ACTIVE' | 'EXPIRED';
    expiryDate: string;
}

export default function MarketingPage() {
    // 3. Marketing (Coupons) Mock Data
    const [coupons] = useState<Coupon[]>([
        { id: 'c1', code: 'JPDK_LAUNCH', discountType: 'PERCENTAGE', value: 20, usageLimit: 100, usedCount: 45, status: 'ACTIVE', expiryDate: '2024-12-31' },
        { id: 'c2', code: 'ENVIO_GRATIS', discountType: 'FIXED', value: 5000, usageLimit: 500, usedCount: 12, status: 'ACTIVE', expiryDate: '2024-10-01' },
        { id: 'c3', code: 'VIP_GANG', discountType: 'PERCENTAGE', value: 30, usageLimit: 10, usedCount: 10, status: 'EXPIRED', expiryDate: '2024-01-01' },
    ]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    return (
        <div className="space-y-6 animate-fade-in text-foreground">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Marketing</h1>
                    <p className="text-muted-foreground text-sm">Cupones y descuentos activos</p>
                </div>
                <Button className="flex items-center gap-2 bg-primary text-primary-foreground">
                    <PlusCircle className="w-4 h-4" />
                    Crear Cupón
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map(coupon => (
                    <div key={coupon.id} className={`bg-card border ${coupon.status === 'ACTIVE' ? 'border-border' : 'border-border/60 opacity-60'} rounded-lg p-0 overflow-hidden relative group hover:shadow-lg transition-all`}>
                        {/* Ticket visual flair */}
                        <div className="absolute left-0 top-1/2 -translate-x-1/2 w-4 h-4 bg-gray-50 dark:bg-black rounded-full border border-gray-200 dark:border-gray-800"></div>
                        <div className="absolute right-0 top-1/2 translate-x-1/2 w-4 h-4 bg-gray-50 dark:bg-black rounded-full border border-gray-200 dark:border-gray-800"></div>

                        <div className="p-6 flex flex-col h-full justify-between border-l-4 border-l-black dark:border-l-white bg-card">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-display font-bold text-2xl tracking-widest text-foreground">{coupon.code}</h3>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${coupon.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {coupon.status}
                                    </span>
                                </div>
                                <div className="mb-4">
                                    <p className="text-4xl font-black tracking-tighter text-foreground">
                                        {coupon.discountType === 'PERCENTAGE' ? `${coupon.value}%` : formatPrice(coupon.value)}
                                        <span className="text-sm font-medium text-muted-foreground ml-1 tracking-normal">OFF</span>
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-border pt-4 flex justify-between items-end text-xs text-muted-foreground">
                                <div>
                                    <p>Usos: <span className="text-foreground font-bold">{coupon.usedCount}</span> / {coupon.usageLimit}</p>
                                    <p>Expira: {coupon.expiryDate}</p>
                                </div>
                                <button className="text-foreground font-bold uppercase hover:underline">Editar</button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Placeholder */}
                <button className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-colors min-h-[200px]">
                    <Plus className="w-10 h-10 mb-2" />
                    <span className="font-bold text-sm uppercase">Nuevo Cupón</span>
                </button>
            </div>
        </div>
    );
}
