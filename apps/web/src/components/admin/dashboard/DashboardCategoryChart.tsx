import { useMemo, useState } from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
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

    const legendData = useMemo(
        () =>
            chartData.map((entry, index) => {
                const percent = totalUnits > 0 ? (entry.value / totalUnits) * 100 : 0;
                return {
                    ...entry,
                    color: colors[index % colors.length],
                    percent,
                };
            }),
        [chartData, colors, totalUnits]
    );

    return (
        <div className="min-w-0 rounded-xl border border-gray-300 bg-card p-6 shadow-sm dark:border-border dark:bg-card h-full min-h-[360px]">
            <div className="flex items-start justify-between gap-3 mb-4">
                <h3 className="font-bold text-sm uppercase tracking-wide text-foreground">
                    Ventas por Categoría - {totalUnits} unidades
                </h3>
                <span className="p-1 text-muted-foreground">
                    <PieChartIcon className="h-5 w-5" />
                </span>
            </div>

            <div className="flex h-[290px] w-full items-center justify-center min-w-0 [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none [&_*:focus]:!outline-none">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} debounce={50}>
                        <PieChart style={{ outline: 'none' }} tabIndex={-1} role="img" aria-label="Ventas por categoría">
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={76}
                                outerRadius={106}
                                paddingAngle={4}
                                dataKey="value"
                                nameKey="name"
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                <Label
                                    position="center"
                                    content={() => (
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                            <tspan x="50%" dy="-0.6em" className="fill-muted-foreground text-[10px] font-bold uppercase tracking-[0.18em]">
                                                TOTAL
                                            </tspan>
                                            <tspan x="50%" dy="1.5em" className="fill-foreground text-2xl font-black">
                                                {totalUnits}
                                            </tspan>
                                        </text>
                                    )}
                                />
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
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        No hay datos disponibles
                    </div>
                )}
            </div>

            {legendData.length > 0 && (
                <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                    {legendData.map((entry, index) => (
                        <div key={`legend-${entry.name}-${index}`} className="flex items-center gap-2 rounded-md border border-border/70 px-2.5 py-2">
                            <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: entry.color }}
                                aria-hidden="true"
                            />
                            <span className="min-w-0 truncate text-muted-foreground">{entry.name}</span>
                            <span className="ml-auto whitespace-nowrap text-right text-foreground">
                                {entry.value} <span className="text-muted-foreground">({entry.percent.toFixed(1)}%)</span>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
