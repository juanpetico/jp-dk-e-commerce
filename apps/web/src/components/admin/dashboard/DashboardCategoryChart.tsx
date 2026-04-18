import { useMemo, useState } from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CategorySalesPoint } from '@/lib/dashboard/types';

interface DashboardCategoryChartProps {
    categoryData: CategorySalesPoint[];
    colors?: string[];
}

const DEFAULT_COLORS = [
    '#16a34a',
    '#2563eb',
    '#9333ea',
    '#78350f',
    '#6366f1',
    '#ec4899',
];

const MAX_VISIBLE_SLICES = 6;

export function DashboardCategoryChart({ categoryData, colors = DEFAULT_COLORS }: DashboardCategoryChartProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const totalUnits = useMemo(
        () => categoryData.reduce((acc, curr) => acc + curr.value, 0),
        [categoryData]
    );

    const chartData = useMemo(() => {
        const sorted = [...categoryData].sort((a, b) => b.value - a.value);

        if (sorted.length <= MAX_VISIBLE_SLICES) {
            return sorted;
        }

        const visible = sorted.slice(0, MAX_VISIBLE_SLICES - 1);
        const hiddenTotal = sorted.slice(MAX_VISIBLE_SLICES - 1).reduce((acc, item) => acc + item.value, 0);

        return [...visible, { name: 'Otros', value: hiddenTotal }];
    }, [categoryData]);

    const renderLegend = () => (
        <div className="mt-4 max-h-20 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-1 text-[11px] sm:grid-cols-2">
                {chartData.map((entry, index) => {
                    const percent = totalUnits > 0 ? (entry.value / totalUnits) * 100 : 0;

                    return (
                        <div key={`legend-${entry.name}-${index}`} className="flex items-center gap-2 text-muted-foreground">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: colors[index % colors.length] }}
                                aria-hidden="true"
                            />
                            <span className="truncate">{entry.name}</span>
                            <span className="ml-auto whitespace-nowrap text-foreground">
                                {entry.value} ({percent.toFixed(1)}%)
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="min-w-0 bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm h-[360px]">
            <div className="flex items-start justify-between gap-3 mb-4">
                <h3 className="font-bold text-sm uppercase tracking-wide text-foreground">
                    Ventas por Categoría - {totalUnits} unidades
                </h3>
                <span className="p-1 text-muted-foreground">
                    <PieChartIcon className="h-5 w-5" />
                </span>
            </div>

            <div className="w-full h-[320px] min-w-0 relative [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none [&_*:focus]:!outline-none">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="99%" height={280} minWidth={1} debounce={50}>
                        <PieChart style={{ outline: 'none' }} tabIndex={-1} role="img" aria-label="Ventas por categoría">
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                nameKey="name"
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${entry.name}-${index}`}
                                        fill={colors[index % colors.length]}
                                        stroke="hsl(var(--card))"
                                        strokeWidth={activeIndex === index ? 3 : 1}
                                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.55}
                                        aria-label={`${entry.name}: ${entry.value} unidades`}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name) => {
                                    const percentage = ((Number(value) / totalUnits) * 100).toFixed(1);
                                    return [`${value} unidades (${percentage}%)`, name];
                                }}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '8px',
                                    color: 'hsl(var(--foreground))',
                                    zIndex: 1000,
                                }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                wrapperStyle={{ zIndex: 1000 }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                align="center"
                                layout="horizontal"
                                height={92}
                                iconType="circle"
                                content={renderLegend}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        No hay datos disponibles
                    </div>
                )}

                {chartData.length > 0 && (
                    <div className="absolute top-0 left-0 right-0 h-[190px] flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total</p>
                            <p className="text-xl font-display font-black text-foreground">{totalUnits}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
