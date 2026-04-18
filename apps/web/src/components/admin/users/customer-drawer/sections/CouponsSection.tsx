import React from 'react';
import { Ticket } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { CouponCard } from '../components/CouponCard';
import { CouponsSectionProps } from '../types';

export function CouponsSection({ activeCoupons, usedCoupons }: CouponsSectionProps) {
    if (activeCoupons.length === 0 && usedCoupons.length === 0) {
        return (
            <EmptyState
                icon={<Ticket className="h-8 w-8" />}
                title="Sin cupones"
                description="Este cliente no tiene cupones asignados."
            />
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {activeCoupons.length > 0 && (
                <section>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Activos ({activeCoupons.length})
                    </p>
                    <div className="flex flex-col gap-2">
                        {activeCoupons.map((record) => (
                            <CouponCard key={record.id} record={record} variant="active" />
                        ))}
                    </div>
                </section>
            )}

            {usedCoupons.length > 0 && (
                <section>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Usados ({usedCoupons.length})
                    </p>
                    <div className="flex flex-col gap-2">
                        {usedCoupons.map((record) => (
                            <CouponCard key={record.id} record={record} variant="used" />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
