import React from 'react';
import { cn } from '@/lib/utils';
import { UserCouponRecord } from '@/services/couponService';
import { formatCLP, formatDate } from '../formatters';

interface CouponCardProps {
    record: UserCouponRecord;
    variant: 'active' | 'used';
}

export function CouponCard({ record, variant }: CouponCardProps) {
    const { coupon } = record;

    return (
        <div
            className={cn(
                'flex items-start justify-between gap-3 rounded-md border p-3',
                variant === 'active' ? 'border-border' : 'border-border opacity-60'
            )}
        >
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-foreground">{coupon.code}</span>
                    <span
                        className={cn(
                            'rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase',
                            variant === 'active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-muted text-muted-foreground'
                        )}
                    >
                        {variant === 'active' ? 'disponible' : 'usado'}
                    </span>
                </div>
                {coupon.description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{coupon.description}</p>}
                <p className="mt-0.5 text-xs text-muted-foreground">Asignado {formatDate(record.assignedAt)}</p>
            </div>

            <div className="shrink-0 text-right">
                <p className="font-mono text-sm font-bold text-foreground">
                    {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatCLP(coupon.value)}
                </p>
                <p className="text-[10px] uppercase text-muted-foreground">
                    {coupon.type === 'PERCENTAGE' ? 'descuento' : 'fijo'}
                </p>
            </div>
        </div>
    );
}
