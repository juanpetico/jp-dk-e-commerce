import { ArrowDownRight, ArrowUpRight, Users } from 'lucide-react';
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
};

export function DashboardCustomerRetentionCard({
    metrics,
    quickRanges,
    selectedQuickRange,
    loading,
    onQuickRangeSelect,
}: DashboardCustomerRetentionCardProps) {
    if (!metrics || loading) {
        return (
            <div className="min-w-0 bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm h-[430px]">
                <p className="text-sm text-muted-foreground">Cargando retención de clientes...</p>
            </div>
        );
    }

    const repeatShare =
        metrics.revenueSplit.totalRevenue > 0
            ? (metrics.revenueSplit.repeatRevenue / metrics.revenueSplit.totalRevenue) * 100
            : 0;
    const newShare = Math.max(0, 100 - repeatShare);
    const growthPositive = metrics.retentionGrowth >= 0;
    const growthLabel = `${growthPositive ? '+' : ''}${metrics.retentionGrowth.toFixed(1)}%`;
    const comparisonLabel = RETENTION_COMPARISON_LABEL[selectedQuickRange];

    return (
        <div className="min-w-0 bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm h-[360px] flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <h3 className="font-bold text-sm uppercase tracking-wide text-foreground">Retención de Clientes</h3>
                    <p className="text-xs text-muted-foreground mt-1">Clientes recurrentes vs nuevos</p>
                </div>
                <span className="p-1 text-muted-foreground">
                    <Users className="w-5 h-5" />
                </span>
            </div>

            <div className="flex items-center justify-between mb-6">
                <h4 className="font-display text-4xl font-black text-foreground">{metrics.retentionRate.toFixed(1)}%</h4>
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

            <div className="flex items-center gap-2 mb-6">
                {quickRanges.map((range) => (
                    <button
                        key={range}
                        type="button"
                        onClick={() => onQuickRangeSelect(range)}
                        className={cn(
                            'text-xs px-2 py-1 rounded-md transition-colors',
                            selectedQuickRange === range
                                ? 'font-bold text-foreground'
                                : 'font-medium text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {range}
                    </button>
                ))}
            </div>

            <div className="mt-4">
                <div className="h-5 w-full overflow-hidden rounded-full bg-muted border border-border flex">
                    <div
                        className="h-full bg-sky-600 transition-all duration-500"
                        style={{ width: `${repeatShare.toFixed(2)}%` }}
                        aria-label="Ingresos recurrentes"
                    />
                    <div
                        className="h-full bg-slate-300 dark:bg-slate-700 transition-all duration-500"
                        style={{ width: `${newShare.toFixed(2)}%` }}
                        aria-label="Ingresos nuevos"
                    />
                </div>
            </div>

            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                <p>
                    <span className="text-sky-600">●</span> Recurrentes: <span className="font-semibold text-foreground">{formatPrice(metrics.revenueSplit.repeatRevenue)}</span>
                </p>
                <p>
                    <span className="text-slate-500">●</span> Nuevos: <span className="font-semibold text-foreground">{formatPrice(metrics.revenueSplit.newRevenue)}</span>
                </p>
                <p className="text-xs pt-1">
                    {metrics.repeatCustomers} recurrentes | {metrics.newCustomers} nuevos | {metrics.activeCustomers} activos
                </p>
            </div>
        </div>
    );
}
