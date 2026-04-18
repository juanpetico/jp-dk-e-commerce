import React from 'react';
import { BarChart2, Ticket, Zap } from 'lucide-react';

interface MarketingPageStatsProps {
    activeCoupons: number;
    totalCoupons: number;
    totalUses: number;
    totalRevenueFormatted: string;
}

export default function MarketingPageStats({
    activeCoupons,
    totalCoupons,
    totalUses,
    totalRevenueFormatted,
}: MarketingPageStatsProps) {
    if (totalCoupons === 0) return null;

    return (
        <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-300 dark:border-border bg-card p-4">
                <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                    <Ticket className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cupones activos</p>
                    <p className="font-mono text-2xl font-black leading-none">
                        {activeCoupons}
                        <span className="ml-1 text-xs font-medium text-muted-foreground">/ {totalCoupons}</span>
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-300 dark:border-border bg-card p-4">
                <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                    <Zap className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total usos</p>
                    <p className="font-mono text-2xl font-black leading-none">{totalUses}</p>
                </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-300 dark:border-border bg-card p-4">
                <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                    <BarChart2 className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ingresos generados</p>
                    <p className="truncate font-mono text-lg font-black leading-none">{totalRevenueFormatted}</p>
                </div>
            </div>
        </div>
    );
}
