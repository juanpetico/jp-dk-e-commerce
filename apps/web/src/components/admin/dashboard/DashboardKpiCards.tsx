import Link from 'next/link';
import { AlertTriangle, DollarSign, ShoppingBag, BarChart3, Truck } from 'lucide-react';
import { DashboardAnalytics, DashboardDateRange, DashboardQuickRange } from '@/lib/dashboard/types';
import { cn, formatPrice } from '@/lib/utils';

interface DashboardKpiCardsProps {
    analytics: DashboardAnalytics;
    previousAnalytics: DashboardAnalytics;
    previousDateRange: DashboardDateRange | undefined;
    basePath: '/admin' | '/superadmin';
    quickRanges: DashboardQuickRange[];
    selectedQuickRange: DashboardQuickRange | null;
    onQuickRangeSelect: (range: DashboardQuickRange) => void;
}

function formatShortDate(date: Date): string {
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
}

function KpiDelta({
    current,
    previous,
    previousDateRange,
    invert = false,
}: {
    current: number;
    previous: number;
    previousDateRange: DashboardDateRange | undefined;
    invert?: boolean;
}) {
    const periodLabel = previousDateRange?.from && previousDateRange?.to
        ? `${formatShortDate(previousDateRange.from)}–${formatShortDate(previousDateRange.to)}`
        : null;

    if (previous === 0) {
        return <span className="text-xs text-muted-foreground font-medium">Sin datos previos</span>;
    }

    const delta = ((current - previous) / previous) * 100;
    const isGood = invert ? delta <= 0 : delta >= 0;
    const sign = delta > 0 ? '+' : '';

    return (
        <span className="text-xs flex items-baseline gap-1 flex-wrap leading-tight">
            <span className={cn('font-bold', isGood ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
                {sign}{delta.toFixed(1)}%
            </span>
            <span className="text-muted-foreground font-normal">
                respecto a {periodLabel ?? 'período anterior'}
            </span>
        </span>
    );
}

export function DashboardKpiCards({ analytics, previousAnalytics, previousDateRange, basePath, quickRanges, selectedQuickRange, onQuickRangeSelect }: DashboardKpiCardsProps) {
    return (
        <div className="space-y-3">
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">KPIs</span>
            <div className="flex gap-1">
                {quickRanges.map((range) => (
                    <button
                        key={range}
                        onClick={() => onQuickRangeSelect(range)}
                        className={cn(
                            'text-[10px] font-bold px-2 py-1 rounded-md transition-colors',
                            selectedQuickRange === range
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                    >
                        {range}
                    </button>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

            {/* Ventas Totales */}
            <div className="bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                <div className="flex justify-between items-start z-10 w-full min-h-8 gap-2">
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider leading-4 h-8 overflow-hidden min-w-0">
                        Ventas Totales
                    </p>
                    <span className="bg-green-600 p-2 rounded-lg text-white shadow-md shadow-green-600/20">
                        <DollarSign className="w-5 h-5" />
                    </span>
                </div>
                <h3 className="font-display text-2xl font-bold leading-none text-foreground h-8 flex items-center">
                    {formatPrice(analytics.totalSales)}
                </h3>
                <div className="pt-1">
                    <KpiDelta
                        current={analytics.totalSales}
                        previous={previousAnalytics.totalSales}
                        previousDateRange={previousDateRange}
                    />
                </div>
            </div>

            {/* Total Órdenes */}
            <div className="bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start w-full min-h-8 gap-2">
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider leading-4 h-8 overflow-hidden min-w-0">
                        Total Órdenes
                    </p>
                    <span className="bg-blue-600 p-2 rounded-lg text-white shadow-md shadow-blue-600/20">
                        <ShoppingBag className="w-5 h-5" />
                    </span>
                </div>
                <h3 className="font-display text-2xl font-bold leading-none text-foreground h-8 flex items-center">
                    {analytics.validOrdersCount}
                </h3>
                <div className="pt-1">
                    <KpiDelta
                        current={analytics.validOrdersCount}
                        previous={previousAnalytics.validOrdersCount}
                        previousDateRange={previousDateRange}
                    />
                </div>
            </div>

            {/* Ticket Promedio (AOV) */}
            <div className="bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start w-full min-h-8 gap-2">
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider leading-4 h-8 overflow-hidden min-w-0">
                        Ticket Promedio
                    </p>
                    <span className="bg-fuchsia-700 p-2 rounded-lg text-white shadow-md shadow-fuchsia-700/20">
                        <BarChart3 className="w-5 h-5" />
                    </span>
                </div>
                <h3 className="font-display text-2xl font-bold leading-none text-foreground h-8 flex items-center">
                    {formatPrice(analytics.aov)}
                </h3>
                <div className="pt-1">
                    <KpiDelta
                        current={analytics.aov}
                        previous={previousAnalytics.aov}
                        previousDateRange={previousDateRange}
                    />
                </div>
            </div>

            {/* Órdenes Pendientes */}
            <div className="bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start w-full min-h-8 gap-2">
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider leading-4 h-8 overflow-hidden min-w-0">
                        Órdenes Pendientes
                    </p>
                    <span className="bg-orange-500 p-2 rounded-lg text-white shadow-md shadow-orange-500/20">
                        <Truck className="w-5 h-5" />
                    </span>
                </div>
                <h3 className="font-display text-2xl font-bold leading-none text-foreground h-8 flex items-center">
                    {analytics.pendingOrders}
                </h3>
                <div className="text-xs text-muted-foreground pt-1">Requieren gestión ahora</div>
            </div>

            {/* Alerta Stock — clicable */}
            <Link
                href={`${basePath}/products?stockAlert=true`}
                className="bg-card dark:bg-card border border-amber-900 dark:border-amber-900/30 p-6 rounded-xl shadow-sm flex flex-col justify-between h-32 relative group transition-colors hover:bg-amber-50/40 dark:hover:bg-amber-900/10"
            >
                <div className="flex justify-between items-start w-full min-h-8 gap-2">
                    <p className="text-amber-900 dark:text-amber-500 text-xs font-bold uppercase tracking-wider leading-4 h-8 overflow-hidden min-w-0">
                        Alerta Stock
                    </p>
                    <span className="bg-amber-900 p-2 rounded-lg text-white shadow-md shadow-amber-900/20">
                        <AlertTriangle className="w-5 h-5" />
                    </span>
                </div>
                <h3 className="font-display text-2xl font-bold leading-none text-amber-900 dark:text-amber-400 h-8 flex items-center">
                    {analytics.lowStockCount}
                </h3>
                <div className="text-xs text-amber-700 dark:text-amber-600 font-medium pt-1 flex items-center gap-1">
                    Ver productos &lt; {analytics.lowStockThreshold} u.
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>
            </Link>

        </div>
        </div>
    );
}
