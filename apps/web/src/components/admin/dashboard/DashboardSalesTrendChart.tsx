import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DatePickerWithRange } from '@/components/ui/DateRangePicker';
import { DashboardDateRange, DashboardQuickRange, SalesTrendPoint } from '@/lib/dashboard/types';
import { cn, formatPrice } from '@/lib/utils';

interface DashboardSalesTrendChartProps {
    salesTrendData: SalesTrendPoint[];
    quickRanges: DashboardQuickRange[];
    selectedQuickRange: DashboardQuickRange | null;
    onQuickRangeSelect: (range: DashboardQuickRange) => void;
    dateRange: DashboardDateRange | undefined;
    onDateRangeChange: (range: DashboardDateRange | undefined) => void;
    defaultDateRange: DashboardDateRange;
}

export function DashboardSalesTrendChart({
    salesTrendData,
    quickRanges,
    selectedQuickRange,
    onQuickRangeSelect,
    dateRange,
    onDateRangeChange,
    defaultDateRange,
}: DashboardSalesTrendChartProps) {
    return (
        <div className="lg:col-span-2 min-w-0 bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm flex flex-col h-96">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="font-bold text-sm uppercase tracking-wide text-foreground mb-2 sm:mb-0">Tendencia de Ingresos</h3>
                    <div className="flex gap-1 mt-1">
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

                <DatePickerWithRange
                    date={dateRange}
                    setDate={onDateRangeChange}
                    defaultDate={defaultDateRange}
                />
            </div>

            <div className="w-full h-full min-h-[250px] min-w-0 [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none [&_*:focus]:!outline-none">
                <ResponsiveContainer width="99%" height={250} minWidth={1} debounce={50}>
                    <AreaChart data={salesTrendData} style={{ outline: 'none' }} tabIndex={-1}>
                        <defs>
                            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            minTickGap={30}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            tickFormatter={(value) => `$${Number(value) / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '8px',
                                color: 'hsl(var(--foreground))',
                            }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                            formatter={(value) => [formatPrice(Number(value)), 'Ventas']}
                        />
                        <Area type="monotone" dataKey="ventas" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorVentas)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
