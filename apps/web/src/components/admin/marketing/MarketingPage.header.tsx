import React from 'react';
import { Download, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MarketingPageHeaderProps {
    loading: boolean;
    visibleCouponsCount: number;
    onCreateCoupon: () => void;
    onExport: () => void;
}

export default function MarketingPageHeader({
    loading,
    visibleCouponsCount,
    onCreateCoupon,
    onExport,
}: MarketingPageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-baseline gap-3">
                    <h1 className="font-display text-4xl font-black uppercase leading-none tracking-tight text-foreground">
                        Marketing
                    </h1>
                    {!loading && (
                        <span className="text-sm font-bold text-muted-foreground">
                            {visibleCouponsCount} {visibleCouponsCount === 1 ? 'cupón' : 'cupones'}
                        </span>
                    )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Cupones, campañas y drivers de fidelización</p>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={onExport}
                    disabled={loading || visibleCouponsCount === 0}
                >
                    <Download className="h-4 w-4" />
                    Exportar
                </Button>
                <Button
                    onClick={onCreateCoupon}
                    className="shrink-0 bg-primary text-xs font-bold uppercase tracking-widest text-primary-foreground"
                >
                    <PlusCircle className="h-4 w-4" />
                    Crear Cupón
                </Button>
            </div>
        </div>
    );
}
