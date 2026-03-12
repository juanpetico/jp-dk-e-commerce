import React from 'react';
import { ProductVariant } from '@/types';
import { cn } from '@/lib/utils';

interface StockBadgeListProps {
    variants: ProductVariant[];
}

export const StockBadgeList: React.FC<StockBadgeListProps> = ({ variants }) => {
    if (!variants || variants.length === 0) {
        return <span className="text-xs text-muted-foreground italic">Sin variante</span>;
    }

    const getStockColorClass = (stock: number) => {
        if (stock <= 5) return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800';
        if (stock < 10) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border-green-200 dark:border-green-800';
    };

    return (
        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
            {variants.map((variant) => (
                <div
                    key={variant.id}
                    className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-tighter transition-colors",
                        getStockColorClass(variant.stock)
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
