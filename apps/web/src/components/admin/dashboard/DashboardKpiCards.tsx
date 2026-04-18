import { AlertTriangle, DollarSign, ShoppingBag, TrendingUp, Truck, ShoppingCart } from 'lucide-react';
import { DashboardAnalytics } from '@/lib/dashboard/types';
import { formatPrice } from '@/lib/utils';

interface DashboardKpiCardsProps {
    analytics: DashboardAnalytics;
}

export function DashboardKpiCards({ analytics }: DashboardKpiCardsProps) {
    const abandonedRateLabel = `${analytics.abandonedCartRate.toFixed(1)}%`;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                <div className="flex justify-between items-start z-10 w-full">
                    <div>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Ventas Totales</p>
                        <h3 className="font-display text-2xl font-bold mt-1 text-foreground">{formatPrice(analytics.totalSales)}</h3>
                    </div>
                    <span className="bg-green-600 p-2 rounded-lg text-white shadow-md shadow-green-600/20">
                        <DollarSign className="w-5 h-5" />
                    </span>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 font-bold z-10 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Actualizado
                </div>
            </div>

            <div className="bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start w-full">
                    <div>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Órdenes Activas</p>
                        <h3 className="font-display text-2xl font-bold mt-1 text-foreground">{analytics.activeOrders}</h3>
                    </div>
                    <span className="bg-blue-600 p-2 rounded-lg text-white shadow-md shadow-blue-600/20">
                        <Truck className="w-5 h-5" />
                    </span>
                </div>
                <div className="text-xs text-muted-foreground">Confirmadas o Enviadas</div>
            </div>

            <div className="bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start w-full">
                    <div>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Ticket Promedio</p>
                        <h3 className="font-display text-2xl font-bold mt-1 text-foreground">{formatPrice(analytics.aov)}</h3>
                    </div>
                    <span className="bg-purple-600 p-2 rounded-lg text-white shadow-md shadow-purple-600/20">
                        <ShoppingBag className="w-5 h-5" />
                    </span>
                </div>
                <div className="text-xs text-muted-foreground">Por orden válida</div>
            </div>

            <div className="bg-card dark:bg-card border border-rose-300 dark:border-rose-900/40 p-6 rounded-xl shadow-sm flex flex-col justify-between h-32 relative">
                <div className="flex justify-between items-start w-full">
                    <div>
                        <p className="text-rose-800 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">Carritos Abandonados</p>
                        <h3 className="font-display text-2xl font-bold mt-1 text-rose-900 dark:text-rose-300">{abandonedRateLabel}</h3>
                    </div>
                    <span className="bg-rose-700 p-2 rounded-lg text-white shadow-md shadow-rose-700/20">
                        <ShoppingCart className="w-5 h-5" />
                    </span>
                </div>
                <div className="text-xs text-rose-700 dark:text-rose-400 font-medium">
                    Potencial en carritos: {formatPrice(analytics.abandonedCartPotentialRevenue)}
                </div>
            </div>

            <div className="bg-card dark:bg-card border border-amber-900 dark:border-amber-900/30 p-6 rounded-xl shadow-sm flex flex-col justify-between h-32 relative">
                <div className="flex justify-between items-start w-full">
                    <div>
                        <p className="text-amber-900 dark:text-amber-500 text-xs font-bold uppercase tracking-wider">Alerta Stock</p>
                        <h3 className="font-display text-2xl font-bold mt-1 text-amber-900 dark:text-amber-400">{analytics.lowStockCount}</h3>
                    </div>
                    <span className="bg-amber-900 p-2 rounded-lg text-white shadow-md shadow-amber-900/20">
                        <AlertTriangle className="w-5 h-5" />
                    </span>
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-600 font-medium">
                    Productos críticos &lt; {analytics.lowStockThreshold} unidades
                </div>
            </div>
        </div>
    );
}
