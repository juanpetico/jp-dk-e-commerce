import { ArrowDownRight, ArrowUpRight, Info, Loader2, Users } from 'lucide-react';
import { DashboardCustomerRetention, DashboardRetentionRange } from '@/types';
import { cn, formatPrice } from '@/lib/utils';

interface DashboardCustomerRetentionCardProps {
    metrics: DashboardCustomerRetention | null;
    quickRanges: DashboardRetentionRange[];
    selectedQuickRange: DashboardRetentionRange;
    loading: boolean;
    onQuickRangeSelect: (range: DashboardRetentionRange) => void;
}

const RETENTION_COMPARISON_LABEL: Record<DashboardRetentionRange, string> = {
    '1D': 'vs dia anterior',
    '7D': 'vs 7 dias anteriores',
    '1M': 'vs mes anterior',
    '3M': 'vs trimestre anterior',
    '6M': 'vs semestre anterior',
    '1Y': 'vs ano anterior',
};

export function DashboardCustomerRetentionCard({
    metrics,
    quickRanges,
    selectedQuickRange,
    loading,
    onQuickRangeSelect,
}: DashboardCustomerRetentionCardProps) {
    if (!metrics) {
        return (
            <div className="min-w-0 rounded-xl border border-gray-300 bg-card p-6 shadow-sm dark:border-border dark:bg-card h-full min-h-[360px]">
                <div className="flex h-full min-h-[360px] items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando retención de clientes...
                </div>
            </div>
        );
    }

    const totalRevenue = metrics.revenueSplit.totalRevenue;
    const hasRevenueData = totalRevenue > 0;
    const repeatShare = hasRevenueData ? (metrics.revenueSplit.repeatRevenue / totalRevenue) * 100 : 0;
    const newShare = hasRevenueData ? Math.max(0, 100 - repeatShare) : 0;
    const growthPositive = metrics.retentionGrowth >= 0;
    const growthLabel = `${growthPositive ? '+' : ''}${metrics.retentionGrowth.toFixed(1)}%`;
    const comparisonLabel = RETENTION_COMPARISON_LABEL[selectedQuickRange] ?? 'vs periodo anterior';
    const retentionByCustomers = metrics.activeCustomers > 0 ? (metrics.repeatCustomers / metrics.activeCustomers) * 100 : 0;
    const repeatAvgTicket = metrics.repeatCustomers > 0 ? metrics.revenueSplit.repeatRevenue / metrics.repeatCustomers : 0;
    const newAvgTicket = metrics.newCustomers > 0 ? metrics.revenueSplit.newRevenue / metrics.newCustomers : 0;

    return (
        <div className="relative min-w-0 rounded-xl border border-gray-300 bg-card p-6 shadow-sm dark:border-border dark:bg-card h-full min-h-[360px]">
            {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-card/70 backdrop-blur-[1px]">
                    <div className="inline-flex items-center gap-2 rounded-md border border-border bg-background/85 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Actualizando datos...
                    </div>
                </div>
            )}

            <div className={cn('flex h-full flex-col', loading && 'opacity-70')}>
            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <h3 className="font-bold text-sm uppercase tracking-wide text-foreground">Retención de Clientes</h3>
                    <p className="text-xs text-muted-foreground mt-1">Clientes recurrentes vs nuevos</p>
                </div>
                <span className="p-1 text-muted-foreground">
                    <Users className="w-5 h-5" />
                </span>
            </div>

            <div className="mb-4 rounded-lg border border-border/70 bg-muted/35 px-3 py-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    Regla del segmento
                </p>
                <p className="mt-1">
                    Recurrente = cliente con al menos una compra completada antes del inicio del periodo. Nuevo = primera compra en el periodo.
                </p>
            </div>

            <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                    {metrics.activeCustomers} clientes activos en el periodo
                </p>
                <span
                    className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                        growthPositive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    )}
                >
                    {growthPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {growthLabel} {comparisonLabel}
                </span>
            </div>

            <div className="mb-5 flex flex-wrap items-center gap-1.5 rounded-lg bg-muted/55 p-1">
                {quickRanges.map((range) => (
                    <button
                        key={range}
                        type="button"
                        onClick={() => onQuickRangeSelect(range)}
                        disabled={loading}
                        className={cn(
                            'rounded-md px-2 py-1.5 text-xs transition-colors',
                            selectedQuickRange === range
                                ? 'bg-background font-bold text-foreground shadow-sm'
                                : 'font-medium text-muted-foreground hover:text-foreground',
                            loading && 'cursor-not-allowed'
                        )}
                    >
                        {range}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-sky-500/30 bg-sky-500/8 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Recurrentes</p>
                    <p className="mt-1 text-xl font-black text-foreground">{formatPrice(metrics.revenueSplit.repeatRevenue)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{metrics.repeatCustomers} clientes</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Ticket prom.: {formatPrice(repeatAvgTicket)}</p>
                </div>

                <div className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Nuevos</p>
                    <p className="mt-1 text-xl font-black text-foreground">{formatPrice(metrics.revenueSplit.newRevenue)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{metrics.newCustomers} clientes</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Ticket prom.: {formatPrice(newAvgTicket)}</p>
                </div>
            </div>

            <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Distribución de ingresos</span>
                    <span>Total: <span className="font-semibold text-foreground">{formatPrice(metrics.revenueSplit.totalRevenue)}</span></span>
                </div>

                {hasRevenueData ? (
                    <>
                        <div className="flex h-6 w-full overflow-hidden rounded-full border border-border bg-muted">
                            <div
                                className="h-full bg-sky-600 transition-all duration-500"
                                style={{ width: `${repeatShare.toFixed(2)}%` }}
                                aria-label="Ingresos recurrentes"
                                title={`Recurrentes: ${repeatShare.toFixed(1)}%`}
                            />
                            <div
                                className="h-full bg-slate-500 transition-all duration-500 dark:bg-slate-400"
                                style={{ width: `${newShare.toFixed(2)}%` }}
                                aria-label="Ingresos nuevos"
                                title={`Nuevos: ${newShare.toFixed(1)}%`}
                            />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-sky-600" aria-hidden="true" />
                                Recurrentes {repeatShare.toFixed(1)}%
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-slate-500 dark:bg-slate-400" aria-hidden="true" />
                                Nuevos {newShare.toFixed(1)}%
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                        Sin ingresos registrados para el periodo seleccionado.
                    </div>
                )}
            </div>

            <div className="mt-auto pt-4">
                <div className="rounded-lg border border-border/70 bg-muted/25 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground">Lectura rápida</p>
                    <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                        <p>Retención por clientes: <span className="font-semibold text-foreground">{retentionByCustomers.toFixed(1)}%</span></p>
                        <p>Variación de retención: <span className={cn('font-semibold', growthPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>{growthLabel}</span> {comparisonLabel}</p>
                        <p>Clientes del periodo: <span className="font-semibold text-foreground">{metrics.repeatCustomers}</span> recurrentes · <span className="font-semibold text-foreground">{metrics.newCustomers}</span> nuevos</p>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
