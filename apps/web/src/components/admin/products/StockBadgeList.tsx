import React from 'react';
import { ProductVariant } from '@/types';
import { cn } from '@/lib/utils';
import { getVariantStockTone } from '@/lib/stock/stock-status';
import { useShopConfigPublic } from '@/hooks/useShopConfigPublic';

interface StockBadgeListProps {
    variants: ProductVariant[];
}

export const StockBadgeList: React.FC<StockBadgeListProps> = ({ variants }) => {
    const { lowStockThreshold } = useShopConfigPublic();

    if (!variants || variants.length === 0) {
        return <span className="text-xs text-muted-foreground italic">Sin variante</span>;
    }

    const getStockColorClass = (variant: ProductVariant) => {
        const tone = getVariantStockTone(variant, lowStockThreshold);

        if (tone === 'critical') return 'bg-red-100 text-red-800 border-red-200';
        if (tone === 'warning') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-green-100 text-green-800 border-green-200';
    };

    return (
        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
            {variants.map((variant) => (
                <div
                    key={variant.id}
                    className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-tighter transition-colors",
                        getStockColorClass(variant)
                    )}
                    title={`Talla ${variant.size}: ${variant.stock} unidades`}
                >
                    <span>{variant.size}:</span>
                    <span>{variant.stock}</span>
                </div>
            ))}
        </div>
    );
};
