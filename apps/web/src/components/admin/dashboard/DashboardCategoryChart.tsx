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

export function DashboardCategoryChart({ categoryData, colors = DEFAULT_COLORS }: DashboardCategoryChartProps) {
    const totalUnits = categoryData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="min-w-0 bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm h-[480px]">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-4 text-foreground">
                Ventas por Categoría ({totalUnits} uds)
            </h3>

            <div className="w-full h-[380px] min-w-0 relative [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none [&_*:focus]:!outline-none">
                {categoryData.length > 0 ? (
                    <ResponsiveContainer width="99%" height={300} minWidth={1} debounce={50}>
                        <PieChart style={{ outline: 'none' }} tabIndex={-1}>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${entry.name}-${index}`}
                                        fill={colors[index % colors.length]}
                                        stroke="hsl(var(--card))"
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
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '20px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        No hay datos disponibles
                    </div>
                )}

                {categoryData.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8 h-full">
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
